'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Recursively discover all subfolders and produce a flattened list.
 * Directories prefixed with '__' are not polyfill features and are not included.
 *
 * @param {string} directory Directory to flatten.
 * @returns {Array<string>} Flattened directory.
 */
module.exports = async function flattenPolyfillDirectories(directory) {
	let results = [];

	const items = await fs.promises.readdir(directory, { withFileTypes: true });

	for (const item of items) {
		const joined = path.join(directory, item.name);

		if (item.isDirectory() && item.name.indexOf('__') !== 0) {
			results = [
				...results,
				...(await flattenPolyfillDirectories(joined)),
				joined,
			];
		}
	}

	return results;
}
