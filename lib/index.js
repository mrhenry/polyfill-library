"use strict";

const stream = require("node:stream");

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

/** @import {PolyfillMeta} from './sources' */

/**
 * Get a list of all the aliases which exist within the collection of polyfill sources.
 * @returns {Promise<Record<string, Array<string>>>} A promise which resolves with an object mapping all the aliases within the collection to the polyfills they include.
 */
function listAliases() {
	return sources.listAliases();
}

/**
 * Get a list of all the polyfills which exist within the collection of polyfill sources.
 * @returns {Promise<Array<string>>} A promise which resolves with an array of all the polyfills within the collection.
 */
function listAllPolyfills() {
	return sources.listPolyfills();
}

/**
 * Get the metadata for a specific polyfill within the collection of polyfill sources.
 * @param {string} featureName - The name of a polyfill whose metadata should be returned.
 * @returns {Promise<PolyfillMeta|undefined>} A promise which resolves with the metadata or with `undefined` if no metadata exists for the polyfill.
 */
function describePolyfill(featureName) {
	return sources.getPolyfillMeta(featureName);
}

/**
 * Check object has properties
 * @param {string} property property name
 * @param {Object} object target object
 * @returns {boolean}
 */
function hasProperty(property, object) {
	return Object.prototype.hasOwnProperty.call(object, property);
}

/**
 * @typedef {Object} UaParser
 * @property {() => string} getFamily
 * @property {(range?: string) => boolean} satisfies
 * @property {() => boolean} isUnknown
 */

/**
 * @typedef {Object} FeatureInput
 * @property {Set<Flag>|Flag[]|undefined=} flags
 * @property {Set<Flag>|Flag[]|undefined=} aliasOf
 * @property {Set<Flag>|Flag[]|undefined=} dependencyOf
 */

/**
 * @typedef {Object} NormalisedOptions
 * @property {string|false} callback
 * @property {UaParser} ua
 * @property {boolean} minify
 * @property {"ignore"|"polyfill"} unknown
 * @property {Record<string, Feature>} features
 * @property {Array<string>} excludes
 */

/**
 * @typedef {Object} Feature
 * @property {Set<Flag>} flags
 * @property {Set<string>} aliasOf
 * @property {Set<string>} dependencyOf
 * @property {string|undefined=} comment
 */

/**
 * Create an options object for use with `getPolyfills` or `getPolyfillString`.
 * @param {Object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {Boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore' | 'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Record<string, FeatureInput>} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {false | string} [options_.callback=false] - Name of the JavaScript function to call after the polyfill bundle is loaded.
 * @param {Array<string>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {UaParser} [options_.ua={}] - The user-agent object to check each feature against.
 * @return {NormalisedOptions} options - options_ merged with the defaults option values.
 */
function getOptions(options_ = {}) {
	/** @type {NormalisedOptions} */
	const options = {
		callback:
			hasProperty("callback", options_) &&
			typeof options_.callback === "string" &&
			/^[\w.]+$/.test(options_.callback)
				? options_.callback
				: false,
		ua: hasProperty("ua", options_) ? /** @type {UaParser} */(options_.ua) : {
			getFamily: () => "other",
			satisfies: () => false,
			isUnknown: () => true
		},
		minify: hasProperty("minify", options_) ? /** @type {boolean} */(options_.minify) : true,
		unknown: hasProperty("unknown", options_) ? /** @type {"ignore"|"polyfill"} */(options_.unknown) : "polyfill",
		features: {},
		excludes: hasProperty("excludes", options_) ? /** @type {Array<string>} */(options_.excludes) : []
	};

	// Normalise flags
	const features = hasProperty("features", options_) ? /** @type {Record<string, Feature>} */(options_.features) : {}
	for (const k of Object.keys(features)) {
		if (!features[k]) {
			features[k] = { flags: new Set(), dependencyOf: new Set(), aliasOf: new Set() };
			continue;
		}

		features[k].flags = new Set(features[k].flags || []);
		features[k].dependencyOf = new Set(features[k].dependencyOf || []);
		features[k].aliasOf = new Set(features[k].aliasOf || []);
	}
	options.features = /** @type {Record<string, Feature>} */(features);

	return options;
}

/**
 * @typedef {'gated'|'always'} Flag
 */

/**
 * Given a set of features that should be polyfilled in 'options.features'
 * (with flags i.e. `{<featurename>: {flags:Set[<flaglist>]}, ...}`),
 * determine which have a configuration valid for the given options.ua,
 * and return a promise of set of canonical (unaliased) features (with flags) and polyfills.
 *
 * @param {Object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore' | 'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Object.<string, FeatureInput>} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {Array<string>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {UaParser} [options_.ua={}] - The user-agent object to check each feature against.
 * @return {Promise<Object.<string, Feature>>} - Canonicalised feature definitions filtered for UA
 */
async function getPolyfills(options_) {
	const options = getOptions(options_);
	const ua = options.ua;
	const featureNames = new Set(Object.keys(options.features));

	/** @type {Record<string, Feature>} */
	const targetedFeatures = Object.create(null);

	/**
	 * A feature would be removed in these scenarios:
	 * - If it has been specified to be excluded from the bundle via the excludes option.
	 * - If the feature is not meant to be in the bundle it does not target the browser.
	 *		Targeting a browser happens if the feature has the always option applied or
	 *		the browser is unsupported/unknown and the unknown option is set to polyfill
	 *		or the browser version is within the semver range specified in the features config.toml file.
	 *
	 * @param {string} featureName
	 */
	function removeFeature(featureName) {
		featureNames.delete(featureName);
		if (targetedFeatures[featureName]) {
			delete targetedFeatures[featureName];
		}
	}

	/**
	 * @param {string} featureName
	 * @param {Feature=} featureFlags
	 * @param {Feature=} featureProperties
	 */
	function addFeature(featureName, featureFlags, featureProperties) {
		targetedFeatures[featureName] = /** @type {Feature} */ Object.assign(Object.create(null), featureFlags, featureProperties);
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

		/** @type {Feature|undefined} */
		const feature = targetedFeatures[featureName] || options.features[featureName];
		if (!feature) {
			continue;
		}

		/** @type {Feature} */
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
			// which I think is better than just pretending it doesn't exist.
			addFeature(featureName);
			continue;
		}
		// If not already targeted, check to see if the polyfill's configuration states it should target
		// this browser version.
		if (!targeted) {
			const isBrowserMatch = !!(meta.browsers &&
				meta.browsers[ua.getFamily()] &&
				ua.satisfies(meta.browsers[ua.getFamily()]));

			targeted = isBrowserMatch;
		}

		if (targeted) {
			addFeature(featureName, feature, properties);
			const dependencies = meta.dependencies;
			// If feature has dependency then add the dependencies as well.
			if (dependencies) {
				/** @type {Feature} */
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
 * @typedef {import('node:stream').Readable} Readable
 */
/**
 * Create a polyfill bundle.
 * @param {Object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore' | 'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Object.<string, FeatureInput>} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {Array<string>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {UaParser} [options_.ua={}] - The user-agent object to check each feature against.
 * @param {boolean} [options_.stream=false] - Whether to return a stream or a string of the polyfill bundle.
 * @return {Promise<string>|stream.Readable} - Polyfill bundle as either a utf-8 stream or a promise of a utf-8 string.
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

/**
 * @param {AsyncGenerator<string>} generator
 * @returns {Promise<string>}
 */
async function consumePolyfillString(generator) {
	let result = "";

	for await (const chunk of generator) {
		result += chunk;
	}

	return result;
}

/**
 * Create a polyfill bundle.
 * @param {Object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {Boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore' | 'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Record<string, FeatureInput>} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {false | string} [options_.callback=false] - Name of the JavaScript function to call after the polyfill bundle is loaded.
 * @param {Array<string>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {UaParser} [options_.ua={}] - The user-agent object to check each feature against.
 * @returns {AsyncGenerator<string>}
 */
async function* generatePolyfillString(options_) {
	const options = getOptions(options_);

	const lf = options.minify ? "" : "\n";
	const polyfillSourceType = options.minify ? "min" : "raw";

	const targetedFeatures = await getPolyfills(options_);

	/** @type {{unknown: Array<string>}} */
	const warnings = {
		unknown: []
	};

	const polyfillsMeta = await sources.listMeta();
	/** @type {Array<[number, string]>} */
	const polyfillOrders = [];

	for (const featureName of Object.keys(targetedFeatures)) {
		const feature = targetedFeatures[featureName];
		if (!feature) {
			return;
		}

		const polyfill = polyfillsMeta[featureName];

		if (!polyfill) {
			warnings.unknown.push(featureName);
			return;
		}

		polyfillOrders.push([polyfill.order, featureName]);

		feature.comment = formatFeatureComment(featureName, feature, polyfill);
	}

	polyfillOrders.sort((a, b) => a[0] - b[0]);
	const sortedFeatures = polyfillOrders.map((x) => x[1]);

	if (options.minify) {
		yield formatMinifiedBundlePrelude(appVersion);
	} else {
		yield formatBundlePrelude(appVersion, options, sortedFeatures, targetedFeatures, warnings);
	}

	if (sortedFeatures.length === 0) {
		if (!options.minify) {
			yield "\n/* No polyfills found for current settings */\n\n";
		}

		if (options.callback) {
			yield formatCallback(options.callback);
		}

		return;
	}

	// Outer closure hides private features from global scope
	yield "(function(self, undefined) {" + lf;

	// Using the graph, get all the polyfill sources in dependency order
	for (const featureName of sortedFeatures) {
		const meta = polyfillsMeta[featureName];

		const feature = targetedFeatures[featureName];
		if (!feature) {
			continue;
		}


		if (!feature.flags.has("gated") || !meta || !meta.detectSource) {
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
		yield formatCallback(options.callback);
	}
}

/**
 * @param {string} appVersion
 * @returns {string}
 */
function formatAppVersionText(appVersion) {
	if (process.env.NODE_ENV === "production") {
		return "Polyfill service v" + appVersion;
	}

	return "Polyfill service DEVELOPMENT MODE - for live use set NODE_ENV to 'production'";
}

/**
 * @param {Feature} feature
 * @returns {string}
 */
function formatRequiredByComment(feature) {
	if (feature.dependencyOf.size > 0 || feature.aliasOf.size > 0) {
		return " (required by " +
			[...feature.dependencyOf, ...feature.aliasOf].join(", ") +
			")";
	}

	return "";
}

/**
 * @param {string} featureName
 * @param {Feature} feature
 * @param {PolyfillMeta} polyfill
 * @returns {string}
 */
function formatFeatureComment(featureName, feature, polyfill) {
	return featureName +
		", License: " +
		(polyfill.license || "CC0") +
		formatRequiredByComment(feature)
}

/**
 * @param {string} appVersion
 * @returns {string}
 */
function formatMinifiedBundlePrelude(appVersion) {
	return "/* " +
		formatAppVersionText(appVersion) + "\n" +
		" * Disable minification (remove `.min` from URL path) for more info\n" +
		" */\n\n";
}

/**
 * @param {string} appVersion
 * @param {NormalisedOptions} options
 * @param {Array<string>} sortedFeatures
 * @param {Record<string, Feature>} targetedFeatures
 * @param {NormalisedOptions} options
 * @param {{unknown: Array<string>}} warnings
 * @returns {string}
 */
function formatBundlePrelude(appVersion, options, sortedFeatures, targetedFeatures, warnings) {
	let output = "";

	output += "/* " +
		formatAppVersionText(appVersion) + "\n" +
		" * For detailed credits and license information see https://github.com/mrhenry/polyfill-library.\n" +
		" *\n" +
		" * Features requested: " + Object.keys(options.features) + "\n" +
		" *\n";

	for (const featureName of sortedFeatures) {
		if (!targetedFeatures[featureName] || !targetedFeatures[featureName].comment) {
			continue;
		}

		output += " * - " + targetedFeatures[featureName].comment + "\n";
	}

	if (warnings.unknown.length > 0) {
		output += " *\n" +
			" * These features were not recognised:\n";

		for (const featureName of warnings.unknown) {
			output += " * - " + featureName + "\n";
		}
	}

	output += " */\n\n";

	return output
}

/**
 * @param {string} callback
 * @returns {string}
 */
function formatCallback(callback) {
	return "\ntypeof " +
		callback +
		"==='function' && " +
		callback +
		"();";
}
