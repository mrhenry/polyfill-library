"use strict";

const stream = require("stream");
const sources = require("./sources");
const appVersion = require("../package.json").version;

module.exports = {
	listAliases,
	listAllPolyfills,
	describePolyfill,
	getOptions,
	getPolyfills,
	getPolyfillString,
	generatePolyfillString
};

/**
 * Get a list of all the aliases which exist within the collection of polyfill sources.
 * @returns {Promise<Object>} A promise which resolves with an object mapping all the aliases within the collection to the polyfills they include.
 */
function listAliases() {
	return sources.listAliases();
}

/**
 * Get a list of all the polyfills which exist within the collection of polyfill sources.
 * @returns {Promise<Array>} A promise which resolves with an array of all the polyfills within the collection.
 */
function listAllPolyfills() {
	return sources.listPolyfills();
}

/**
 * Get the metadata for a specific polyfill within the collection of polyfill sources.
 * @param {String} featureName - The name of a polyfill whose metadata should be returned.
 * @returns {Promise<Object|undefined>} A promise which resolves with the metadata or with `undefined` if no metadata exists for the polyfill.
 */
function describePolyfill(featureName) {
	return sources.getPolyfillMeta(featureName);
}

function hasProperty(property, object) {
	return Object.prototype.hasOwnProperty.call(object, property);
}

/**
 * Create an options object for use with `getPolyfills` or `getPolyfillString`.
 * @param {object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {Boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore'|'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Object} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {false|String} [options_.callback=false] - Name of the JavaScript function to call after the polyfill bundle is loaded.
 * @param {Array<String>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {Object} [options_.ua={}] - The user-agent object to check each feature against.
 * @return {Object} options - options_ merged with the defaults option values.
 */
function getOptions(options_ = {}) {
	const options = {
		callback:
			hasProperty("callback", options_) &&
			typeof options_.callback === "string" &&
			/^[\w.]+$/.test(options_.callback)
				? options_.callback
				: false,
		ua: hasProperty("ua", options_) ? options_.ua : {
			getFamily: () => "other",
			satisfies: () => false,
			isUnknown: () => true
		},
		minify: hasProperty("minify", options_) ? options_.minify : true,
		unknown: hasProperty("unknown", options_) ? options_.unknown : "polyfill",
		features: hasProperty("features", options_) ? options_.features : {},
		excludes: hasProperty("excludes", options_) ? options_.excludes : []
	};

	// Normalise flags
	for (const k of Object.keys(options.features)) {
		if (!options.features[k].flags) {
			options.features[k].flags = new Set();
		} else if (options.features[k].flags.constructor !== Set) {
			options.features[k].flags = new Set(options.features[k].flags);
		}
	}

	return options;
}

/**
 * Given a set of features that should be polyfilled in 'options.features'
 * (with flags i.e. `{<featurename>: {flags:Set[<flaglist>]}, ...}`),
 * determine which have a configuration valid for the given options.ua,
 * and return a promise of set of canonical (unaliased) features (with flags) and polyfills.
 *
 * @param {object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {Boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore'|'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Object} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {Array<String>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {Object} [options_.ua={}] - The user-agent object to check each feature against.
 * @return {Promise<Object>} - Canonicalised feature definitions filtered for UA
 */
async function getPolyfills(options_) {
	const options = getOptions(options_);
	let ua = hasProperty("ua", options_) ? options_.ua : {
		getFamily: () => "other",
		satisfies: () => false,
		isUnknown: () => true
	};
	const featureNames = new Set(Object.keys(options.features));
	const targetedFeatures = Object.create(null);

	/*
		A feature would be removed in these scenarios:
		- If it has been specified to be excluded from the bundle via the exlcudes option.
		- If the feature is not meant to be in the bundle it does not target the browser.
				Targeting a browser happens if the feature has the always option applied or
				the browser is unsupported/unknown and the unknown option is set to polyfill
				or the browser version is within the semver range specified in the features config.toml file.
	*/
	function removeFeature(featureName) {
		featureNames.delete(featureName);
		if (targetedFeatures[featureName]) {
			delete targetedFeatures[featureName];
		}
	}

	function addFeature(featureName, featureFlags, featureProperties) {
		targetedFeatures[featureName] = Object.assign(Object.create(null), featureFlags, featureProperties);
		featureNames.add(featureName);
	}

	const polyfillsMeta = await sources.listMeta();
	const aliases = await sources.listAliases();

	for (const featureName of featureNames) {
		// Remove feature if it exists in the `excludes` array.
		if (options.excludes.includes(featureName)) {
			removeFeature(featureName);
			continue;
		}

		const feature = targetedFeatures[featureName] || options.features[featureName];
		const properties = {
			aliasOf: new Set((feature.aliasOf || [])),
			dependencyOf: new Set((feature.dependencyOf || [])),
			flags: new Set(feature.flags || [])
		};

		// If featureName is an alias for a group of features
		// Add each feature.
		const alias = aliases[featureName];
		if (alias) {
			const aliasProperties = {
				aliasOf: new Set(properties.aliasOf),
				dependencyOf: new Set(properties.dependencyOf),
				flags: new Set(properties.flags)
			};
			aliasProperties.aliasOf.add(featureName);
			for (const aliasedFeature of alias) {
				addFeature(aliasedFeature, feature, aliasProperties);
			}
			continue;
		}

		// If always flag is set, then the feature should be targeted at the browser.
		let targeted = feature.flags.has("always");

		// If not already targeted, then set targeted to true if the browser is unknown/unsupported
		// and the unknown option is set the serve polyfills.
		if (!targeted) {
			const unknownOverride = options.unknown === "polyfill" && ua.isUnknown();
			if (unknownOverride) {
				targeted = true;
				properties.flags.add("gated");
			}
		}

		const meta = polyfillsMeta[featureName];
		if (!meta) {
			// this is a bit strange but the best thing I could come up with.
			// by adding the feature, it will show up as an "unrecognized" polyfill
			// which I think is better than just pretending it doesn't exsist.
			addFeature(featureName);
			continue;
		}
		// If not already targeted, check to see if the polyfill's configuration states it should target
		// this browser version.
		if (!targeted) {
			const isBrowserMatch = meta.browsers &&
				meta.browsers[ua.getFamily()] &&
				ua.satisfies(meta.browsers[ua.getFamily()]);

			targeted = isBrowserMatch;
		}

		if (targeted) {
			addFeature(featureName, feature, properties);
			const dependencies = meta.dependencies;
			// If feature has dependency then add the dependencies as well.
			if (dependencies) {
				const dependencyProperties = {
					aliasOf: new Set(properties.aliasOf),
					dependencyOf: new Set(properties.dependencyOf).add(featureName),
					flags: new Set(properties.flags)
				};
				for (const dependency of dependencies) {
					addFeature(dependency, feature, dependencyProperties);
				}
			}
		} else {
			removeFeature(featureName);
		}
	}

	return targetedFeatures;
}

/**
 * Create a polyfill bundle.
 * @param {object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {Boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore'|'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Object} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {Array<String>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {Object} [options_.ua={}] - The user-agent object to check each feature against.
 * @param {Boolean} [options_.stream=false] - Whether to return a stream or a string of the polyfill bundle.
 * @return {Promise<String> | ReadStream} - Polyfill bundle as either a utf-8 stream or a promise of a utf-8 string.
 */
function getPolyfillString(options_) {
	if (options_.stream) {
		return stream.Readable.from(generatePolyfillString(options_));
	}

	return new Promise((resolve, reject) => {
		const generator = generatePolyfillString(options_);

		consumePolyfillString(generator)
			.then(resolve)
			.catch(reject);
	});
}

async function consumePolyfillString(generator) {
	let result = "";

	for await (const chunk of generator) {
		result += chunk;
	}

	return result;
}

/**
 * Create a polyfill bundle.
 * @param {object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {Boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore'|'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Object} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {Array<String>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {Object} [options_.ua={}] - The user-agent object to check each feature against.
 */
async function* generatePolyfillString(options_) {
	const options = getOptions(options_);

	const lf = options.minify ? "" : "\n";
	const polyfillSourceType = options.minify ? "min" : "raw";

	const appVersionText = "Polyfill service " +
		(process.env.NODE_ENV === "production"
			? "v" + appVersion
			: "DEVELOPMENT MODE - for live use set NODE_ENV to 'production'")

	const targetedFeatures = await getPolyfills(options);

	const warnings = {
		unknown: []
	};

	const polyfillsMeta = await sources.listMeta();
	const polyfillOrders = [];

	for (const featureName of Object.keys(targetedFeatures)) {
		const feature = targetedFeatures[featureName];
		const polyfill = polyfillsMeta[featureName];

		if (!polyfill) {
			warnings.unknown.push(featureName);
			return;
		}

		polyfillOrders.push([polyfill.order, featureName]);

		let requiredByComment = "";
		if (feature.dependencyOf.size > 0 || feature.aliasOf.size > 0) {
			requiredByComment =
				" (required by " +
				[...feature.dependencyOf, ...feature.aliasOf].join(", ") +
				")";
		}

		feature.comment =
			featureName +
			", License: " +
			(polyfill.license || "CC0") +
			requiredByComment;
	}

	polyfillOrders.sort((a, b) => a[0] - b[0]);
	const sortedFeatures = polyfillOrders.map((x) => x[1]);

	if (options.minify) {
		yield "/* " +
			appVersionText + "\n" +
			" * Disable minification (remove `.min` from URL path) for more info\n" +
			" */\n\n";
	} else {
		yield "/* " +
			appVersionText + "\n" +
			" * For detailed credits and license information see https://github.com/mrhenry/polyfill-library.\n" +
			" *\n" +
			" * Features requested: " + Object.keys(options.features) + "\n" +
			" *\n";

			for (const featureName of sortedFeatures) {
				if (!targetedFeatures[featureName] || !targetedFeatures[featureName].comment) {
					continue;
				}

				yield " * - " + targetedFeatures[featureName].comment + "\n";
			}

		if (warnings.unknown.length > 0) {
			yield " *\n" +
				" * These features were not recognised:\n";

			for (const featureName of warnings.unknown) {
				yield " * - " + featureName + "\n";
			}
		}

		yield " */\n\n";
	}

	if (sortedFeatures.length === 0) {
		if (!options.minify) {
			yield "\n/* No polyfills found for current settings */\n\n";
		}

		if (options.callback) {
			yield "\ntypeof " +
				options.callback +
				"==='function' && " +
				options.callback +
				"();";
		}

		return;
	}

	// Outer closure hides private features from global scope
	yield "(function(self, undefined) {" + lf;

	// Using the graph, get all the polyfill sources in dependency order
	for (const featureName of sortedFeatures) {
		const meta = polyfillsMeta[featureName];
		if (!targetedFeatures[featureName].flags.has("gated") || !meta.detectSource) {
			for await (const chunk of sources.streamPolyfillSource(featureName, polyfillSourceType)) {
				yield chunk;
			}
			continue;
		}

		yield "if (!(" + meta.detectSource + ")) {" + lf;

		for await (const chunk of sources.streamPolyfillSource(featureName, polyfillSourceType)) {
			yield chunk;
		}

		yield "}" + lf + lf;
	}

	// Invoke the closure, passing the global object as the only argument
	yield "})" +
		lf +
		"('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});" +
		lf;

	if (options.callback) {
		yield "\ntypeof " +
			options.callback +
			"==='function' && " +
			options.callback +
			"();";
	}
}
