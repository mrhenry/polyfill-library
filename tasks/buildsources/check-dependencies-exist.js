'use strict';

/**
 * Validate the dependency graph for a list of polyfills.
 *
 * @param {Array<Polyfill>} polyfills The list of polyfills.
 * @throws When a dependency is missing.
 */
module.exports = function checkDependenciesExist(polyfills) {
	for (const polyfill of polyfills) {
		for (const dependency of polyfill.dependencies) {
			if (!polyfills.some(function (polyfill) {
					return dependency === polyfill.name;
				})) {
				return Promise.reject(`Polyfill ${polyfill.name} depends on ${dependency}, which does not exist within the polyfill-library. Recommended to either add the missing polyfill or remove the dependency.`);
			}
		}
	}
	return Promise.resolve();
}
