'use strict';

const toposort = require('toposort');

/**
 * Validate the dependency graph for a list of polyfills.
 *
 * @param {Array<Polyfill>} polyfills The list of polyfills.
 * @throws When there is a circular dependency.
 */
module.exports = function toposortPolyfills(polyfills) {
	const graph = [];

	polyfills.sort((a, b) => a.name.localeCompare(b.name));
	for (const polyfill of polyfills) {
		polyfill.dependencies.sort((a, b) => a.localeCompare(b));

		for (const dependency of polyfill.dependencies) {
			graph.push([dependency, polyfill.name]);
		}
	}

	try {
		return toposort(graph);
	} catch (error) {
		throw new Error(
			'There is a circle in the dependency graph.\n' +
			'Check the `dependencies` property of polyfill config files that have recently changed, and ensure that they do not form a circle of references.', {
				cause: error
			}
		);
	}
}
