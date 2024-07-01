"use strict";

const fs = require("node:fs");
const path = require("node:path");

const polyfillDirectory = path.join(__dirname, "..", "polyfills", "__dist");

const _memoized = Object.create(null);

let fsImpl = {
	readFile: fs.promises.readFile,
	createReadStream: fs.createReadStream
};

/**
 * Get the metadata for a specific polyfill within the collection of polyfill sources.
 * @param {String} featureName - The name of a polyfill whose metadata should be returned.
 * @returns {Promise<Object|undefined>} A promise which resolves with the metadata or with `undefined` if no metadata exists for the polyfill.
 */
async function getPolyfillMeta(featureName) {
	try {
		const meta = await fsImpl.readFile(
			path.join(polyfillDirectory, featureName, "meta.json"),
			"utf-8"
		);

		return JSON.parse(meta);
	} catch (_) {
		// if file doesn't exist
		return undefined;
	}
}

/**
 * Get a list of all the polyfills which exist within the collection of polyfill sources.
 * @returns {Promise<Array<string>>} A promise which resolves with an array of all the polyfills within the collection.
 */
async function listPolyfills() {
	if (_memoized.features) {
		return _memoized.features;
	}

	_memoized.features = Object.keys(await listMeta());

	return _memoized.features;
}

/**
 * Get a list of all the polyfill aliases which exist within the collection of polyfill sources.
 * @returns {Promise<Record<string, Array<string>>>} A promise which resolves with an object mapping all the aliases within the collection to the polyfills they include.
 */
async function listAliases() {
	if (_memoized.aliases) {
		return _memoized.aliases;
	}

	const aliasesFile = await fsImpl.readFile(
		path.join(polyfillDirectory, "aliases.json"),
		'utf-8',
	);

	_memoized.aliases = Object.create(null);
	for (const [aliasName, aliasValue] of Object.entries(JSON.parse(aliasesFile))) {
		_memoized.aliases[aliasName] = aliasValue;
	}

	return _memoized.aliases;
}

/**
 * Get the polyfills that are under the same alias.
 * @param {String} alias - The name of an alias whose metadata should be returned.
 * @returns {Promise<Array<string>|undefined>} A promise which resolves with the metadata or with `undefined` if no alias with that name exists.
 */
async function getConfigAliases(alias) {
	return (await listAliases())[alias];
}

/**
 * Get a list of all the polyfill metadata which exist within the collection of polyfill sources.
 * @returns {Promise<Record<string, {aliases: Array<string>, browsers: Record<string, string>, dependencies: Array<string>, detectSource: string | undefined, license: string, order: number}>>}
 *
 * @private This function is not intended to be used outside of this module.
 */
async function listMeta() {
	if (_memoized.meta) {
		return _memoized.meta;
	}

	const polyfillsMetaFile = await fsImpl.readFile(
		path.join(polyfillDirectory, "meta.json"),
		'utf-8',
	);

	_memoized.meta = Object.create(null);
	for (const [feature, meta] of Object.entries(JSON.parse(polyfillsMetaFile))) {
		_memoized.meta[feature] = meta;
	}

	return _memoized.meta;
}

/**
 * Get a specific polyfill.
 * @param {String} featureName - The name of a polyfill whose implementation should be returned.
 * @param {'min'|'raw'} type - Which implementation should be returned: minified or raw implementation.
 * @returns {ReadStream} A ReadStream instance of the polyfill implementation as a utf-8 string.
 */
function streamPolyfillSource(featureName, type) {
	return fsImpl.createReadStream(
		path.join(polyfillDirectory, featureName, type + ".js"),
		{
			encoding: "UTF-8"
		}
	);
}

/**
 * Set the file system implementation to use.
 * The default implementation uses the Node.js `fs` module.
 *
 * @param {Object} readFile - A function that reads a file and returns a promise.
 * @param {Object} createReadStream - A function that creates a read stream.
 */
function setFs(readFile, createReadStream) {
	fsImpl = {
		readFile,
		createReadStream
	};
}

module.exports = {
	streamPolyfillSource,
	getConfigAliases,
	listAliases,
	listPolyfills,
	listMeta,
	getPolyfillMeta,
	setFs
};
