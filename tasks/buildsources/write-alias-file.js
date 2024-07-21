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
module.exports = async function writeAliasFile(polyfills, directory) {
	const aliases = {};

	for (const polyfill of polyfills) {
		for (const alias of polyfill.aliases) {
			if (aliases[alias]) {
				aliases[alias] = [...aliases[alias], polyfill.name];
			} else {
				aliases[alias] = [polyfill.name];
			}
		}
	}

	await fs.promises.writeFile(path.join(directory, 'aliases.json'), JSON.stringify(aliases));
}
