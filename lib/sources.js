"use strict";

const fs = require("node:fs");
const path = require("node:path");

const readFile = fs.promises.readFile;
const readdir = fs.promises.readdir;

const polyfillDirectory = path.join(__dirname, "..", "polyfills", "__dist");

/**
 * Get the metadata for a specific polyfill within the collection of polyfill sources.
 * @param {String} featureName - The name of a polyfill whose metadata should be returned.
 * @returns {Promise<Object|undefined>} A promise which resolves with the metadata or with `undefined` if no metadata exists for the polyfill.
 */
async function getPolyfillMeta(featureName) {
	try {
		const meta = await readFile(
			path.join(polyfillDirectory, featureName, "meta.json"),
			"utf-8"
		);

		return JSON.parse(meta);
	} catch (_) {
		// if file doesn't exist
		return undefined;
	}
}

let _featuresMemoized;
const features = (async function () {
	if (_featuresMemoized) {
		return _featuresMemoized;
	}

	const polyfillFiles = await readdir(polyfillDirectory);
	_featuresMemoized = polyfillFiles.filter(f => !f.endsWith(".json"));

	return _featuresMemoized;
}());

/**
 * Get a list of all the polyfills which exist within the collection of polyfill sources.
 * @returns {Promise<Array<string>>} A promise which resolves with an array of all the polyfills within the collection.
 */
function listPolyfills() {
	return features;
}

let _aliasesMemoized;
const aliases = (async function () {
	if (_aliasesMemoized) {
		return _aliasesMemoized;
	}

	const aliasesFile = await readFile(
		path.join(polyfillDirectory, "aliases.json"),
		'utf-8',
	);

	_aliasesMemoized = Object.create(null);
	for (const [aliasName, aliasValue] of Object.entries(JSON.parse(aliasesFile))) {
		_aliasesMemoized[aliasName] = aliasValue;
	}

	return _aliasesMemoized;
}());

/**
 * Get a list of all the polyfill aliases which exist within the collection of polyfill sources.
 * @returns {Promise<Record<string, Array<string>>>} A promise which resolves with an object mapping all the aliases within the collection to the polyfills they include.
 */
function listAliases() {
	return aliases;
}

/**
 * Get the polyfills that are under the same alias.
 * @param {String} alias - The name of an alias whose metadata should be returned.
 * @returns {Promise<Array<string>|undefined>} A promise which resolves with the metadata or with `undefined` if no alias with that name exists.
 */
async function getConfigAliases(alias) {
	return (await listAliases())[alias];
}

let _polyfillsMetaMemoized;
const polyfillsMeta = (async function () {
	if (_polyfillsMetaMemoized) {
		return _polyfillsMetaMemoized;
	}

	const polyfillsMetaFile = await readFile(
		path.join(polyfillDirectory, "meta.json"),
		'utf-8',
	);

	_polyfillsMetaMemoized = Object.create(null);
	for (const [feature, meta] of Object.entries(JSON.parse(polyfillsMetaFile))) {
		_polyfillsMetaMemoized[feature] = meta;
	}

	return _polyfillsMetaMemoized;
}());

/**
 * Get a list of all the polyfill metadata which exist within the collection of polyfill sources.
 * @returns {Promise<Record<string, {aliases: Array<string>, browsers: Record<string, string>, dependencies: Array<string>, detectSource: string | undefined, license: string, order: number}>>}
 *
 * @private This function is not intended to be used outside of this module.
 */
function listMeta() {
	return polyfillsMeta;
}

/**
 * Get a specific polyfill.
 * @param {String} featureName - The name of a polyfill whose implementation should be returned.
 * @param {'min'|'raw'} type - Which implementation should be returned: minified or raw implementation.
 * @returns {Promise<string>} A promise resolving the polyfill implementation as a utf-8 string.
 */
function getPolyfillSource(featureName, type) {
	return readFile(
		path.join(polyfillDirectory, featureName, type + ".js"),
		"utf-8"
	);
}

/**
 * Get a specific polyfill.
 * @param {String} featureName - The name of a polyfill whose implementation should be returned.
 * @param {'min'|'raw'} type - Which implementation should be returned: minified or raw implementation.
 * @returns {ReadStream} A ReadStream instance of the polyfill implementation as a utf-8 string.
 */
function streamPolyfillSource(featureName, type) {
	return fs.createReadStream(
		path.join(polyfillDirectory, featureName, type + ".js"),
		{
			encoding: "UTF-8"
		}
	);
}

module.exports = {
	streamPolyfillSource,
	getPolyfillSource,
	getConfigAliases,
	listAliases,
	listPolyfills,
	listMeta,
	getPolyfillMeta
};
