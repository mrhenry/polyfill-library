'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Write "aliases.json" to the output directory.
 *
 * @param {Array<Polyfill>} polyfills list of polyfills
 * @param {string} directory output directory location
 *
 * @throws When writing a valid JSON to the output directory fails.
 */
module.exports = async function writeMetaFile(polyfills, directory) {
	const meta = {};

	for (let index = 0; index < polyfills.length; index++) {
		const polyfill = polyfills[index];

		meta[polyfill.name] = {
			aliases: polyfill.config.aliases,
			browsers: polyfill.config.browsers,
			dependencies: polyfill.config.dependencies,
			detectSource: polyfill.config.detectSource,
			license: polyfill.config.license,
			order: index,
		}
	}

	await fs.promises.writeFile(path.join(directory, 'meta.json'), JSON.stringify(meta));
}
