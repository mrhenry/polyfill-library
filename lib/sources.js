"use strict";

const fs = require("node:fs");
const path = require("node:path");
const stream = require('node:stream');

const LRUCache = require('mnemonist/lru-cache');

const readFile = fs.promises.readFile;
const readdir = fs.promises.readdir;
// @ts-expect-error
const polyfillMetaCache = new LRUCache(1000);
// @ts-expect-error
const polyfillSourceCache = new LRUCache(1000);

const polyfillDirectory = path.join(__dirname, "../polyfills/__dist");

/**
 * @typedef {Object} PolyfillMeta
 * @property {string} detectSource
 * @property {string} baseDir
 * @property {number} size
 * @property {Array<string>|undefined} aliases
 * @property {Array<string>|undefined} dependencies
 * @property {string|undefined} spec
 * @property {string|undefined} repo
 * @property {string|undefined} docs
 * @property {string} license
 * @property {Array<string>|undefined} notes
 * @property {Record<string, string>} browsers
 */

/**
 * Get the metadata for a specific polyfill within the collection of polyfill sources.
 * @param {String} featureName - The name of a polyfill whose metadata should be returned.
 * @returns {Promise<PolyfillMeta|undefined>} A promise which resolves with the metadata or with `undefined` if no metadata exists for the polyfill.
 */
async function getPolyfillMeta(featureName) {
	let meta = polyfillMetaCache.get(featureName);
	if (meta === undefined) {
		try {
			meta = await readFile(
				path.join(polyfillDirectory, featureName, "meta.json"),
				"utf-8"
			);
			meta = JSON.parse(meta);
			polyfillMetaCache.set(featureName, meta);
		} catch (error) {
			console.warn(`Reading polyfill metadata for '${featureName}' failed\n  ${(error instanceof Error)  ? error.message : error}`);
			// if file doesn't exist
			meta = undefined;
		}
	}
	return meta;
}

const features = (async function() {
	const polyfillFiles = await readdir(polyfillDirectory);
	return polyfillFiles.filter(f => !f.endsWith(".json"));
}());

/**
 * Get a list of all the polyfills which exist within the collection of polyfill sources.
 * @returns {Promise<Array<string>>} A promise which resolves with an array of all the polyfills within the collection.
 */
function listPolyfills() {
	return features;
}

/** @type {Promise<Record<string,Array<string>>>} */
const _aliases = (async function() {
	const aliasesFile = await readFile(path.join(polyfillDirectory, "aliases.json"), 'utf-8');

	/** @type {Record<string,Array<string>>} */
	const result = Object.create(null);
	for (const [aliasName, aliasValue] of Object.entries(JSON.parse(aliasesFile))) {
		result[aliasName] = aliasValue;
	}
	return result;
}());

/**
 * Get a list of all the polyfill aliases which exist within the collection of polyfill sources.
 * @returns {Promise<Record<string,Array<string>>>} A promise which resolves with an object mapping all the aliases within the collection to the polyfills they include.
 */
function listAliases() {
	return _aliases;
}

/**
 * Get the polyfills that are under the same alias.
 * @param {String} alias - The name of an alias whose metadata should be returned.
 * @returns {Promise<Array<string>|undefined>} A promise which resolves with the metadata or with `undefined` if no alias with that name exists.
 */
async function getConfigAliases(alias) {
	const aliases = await listAliases();
	return aliases[alias];
}

/**
 * Get the aliases for a specific polyfill.
 * @param {String} featureName - The name of a polyfill whose implementation should be returned.
 * @param {'min'|'raw'} type - Which implementation should be returned: minified or raw implementation.
 * @returns {stream.Readable} A ReadStream instance of the polyfill implementation as a utf-8 string.
 */
function streamPolyfillSource(featureName, type) {
	const key = featureName + '.' + type;
	const cachedSource = polyfillSourceCache.get(key);
	if (cachedSource !== undefined) {
		return stream.Readable.from(cachedSource);
	}

	const readStream = fs.createReadStream(
		path.join(polyfillDirectory, featureName, type + ".js"), {
			encoding: "utf-8"
		}
	);

	/** @type {Array<string>} */
	const buf = [];
	readStream.on('data', (chunk) => {
		buf.push(chunk.toString("utf-8"));
	});

	readStream.on('end', () => {
		const source = buf.join('');
		polyfillSourceCache.set(key, source);
	});

	return readStream;
}

module.exports = {
	streamPolyfillSource,
	getConfigAliases,
	listAliases,
	listPolyfills,
	getPolyfillMeta
};
