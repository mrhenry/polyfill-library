const exec = require('child_process').exec;
const Polyfill = require('../../tasks/buildsources/polyfill');
const flattenPolyfillDirectories = require('../../tasks/buildsources/flatten-polyfill-directories');
const path = require('path');
const toposort = require('toposort');

const polyfillsDirectory = path.join(process.cwd(), 'polyfills');

module.exports = modifiedPolyfillsWithTests;

/**
 * Get a list of polyfills that have changes when compared against master.
 * Also includes a list of polyfills that should be tested again.
 * 
 * @type {Promise} 
 */
function modifiedPolyfillsWithTests() {
	return new Promise((resolve, reject) => {
		// 1. Check git to see which files changed.

		const modified = {
			polyfills: {},
			hasOtherChanges: false,
			hasManyPolyfillChanges: false
		};

		const currentBranch = process.env.GITHUB_REF || 'HEAD'
		const baseBranch = process.env.GITHUB_ACTIONS ? 'upstream/master' : 'master';

		exec(`git --no-pager diff --name-only ${currentBranch} $(git merge-base ${currentBranch} ${baseBranch})`, (error, stdout, stderr) => {
			if (error) {
				// NOTE : it might make more sense not to reject here but resolve "{ testEverything: true }" instead.
				// If rejecting doesn't cause issues this note can be removed.
				reject(new Error(`getting modified files : ${error.message}`));
				return;
			}
			
			if (stderr) {
				// NOTE : it might make more sense not to reject here but resolve "{ testEverything: true }" instead.
				// If rejecting doesn't cause issues this note can be removed.
				reject(new Error(`getting modified files : ${stderr}`));
				return;
			}

			const list = stdout.split(/\r\n|\r|\n/).filter((x) => {
				return !!x;
			});

			list.forEach((modifiedFilePath) => {
				// 1.a. Check if the changed file is for a polyfill or not.

				if (modifiedFilePath.startsWith('polyfills/')) {
					const polyfillPath = path.dirname(modifiedFilePath);

					const absolute = path.join(process.cwd(), polyfillPath);
					if (absolute === polyfillsDirectory) {
						// Some file directly in the "polyfills" directory (e.g. '.eslintrc')
						modified.hasOtherChanges = true;
						return;
					}

					const polyfill = new Polyfill(absolute, path.relative(polyfillsDirectory, absolute));
					modified.polyfills[polyfill.name] = polyfill;
				} else {
					modified.hasOtherChanges = true;
				}
			});

			if (Object.keys(modified.polyfills).length > 20) {
				// 1.b. If there are too many changes it is better to run a full test suite for all polyfills.

				modified.hasManyPolyfillChanges = true;
			}

			resolve(modified);
		});
	}).then(async (modified) => {
		// 2. If only a few polyfills were changed build a depedency graph

		if (modified.hasManyPolyfillChanges) {
			return modified;
		}

		if (!modified.polyfills || Object.keys(modified.polyfills).length === 0) {
			return modified;
		}

		for (const polyfillName in modified.polyfills) {
			await modified.polyfills[polyfillName].loadConfig();
		}

		// 2.a. Start by adding the directly modified polyfills to the full list.
		const changedNames = {};
		for (const polyfillName in modified.polyfills) {
			changedNames[polyfillName] = true;

			const polyfill = modified.polyfills[polyfillName];
			if (polyfill.config.aliases) {
				for (const alias of polyfill.config.aliases) {
					changedNames[alias] = true;
				}
			}
		}

		// 2.b. Get all polyfills
		const allPolyfills = [];
		const polyfillPaths = flattenPolyfillDirectories(polyfillsDirectory);
		for (const polyfillPath of polyfillPaths) {
			const polyfill = new Polyfill(polyfillPath, path.relative(polyfillsDirectory, polyfillPath));
			if (!polyfill.hasConfigFile) {
				continue;
			}

			await polyfill.loadConfig();
			allPolyfills.push(polyfill);
		}

		// 2.c. Apply toposort to all polyfills.
		const toposortedPolyfills = toposortPolyfills(allPolyfills);

		// 2.d. Check all polyfills for dependants.

		// NOTE : There is probably a smarter more efficient algorithm to do this.
		// This basically brute forces the toposorted depedency list 
		// until no more polyfills are found that depend on changed polyfills.
		let foundMore = true;
		while (foundMore) {
			foundMore = false;
			for (const changed in changedNames) {
				for (const dependencyPair of toposortedPolyfills) {
					if (changed === dependencyPair[0] && !changedNames[dependencyPair[1]]) {
						changedNames[dependencyPair[1]] = true;
						foundMore = true;
					}
				}
			}
		}

		// 2.e. Construct a record of <string, Polyfill> with all affected Polyfills.
		const affectedPolyfills = {};
		for (const changed in changedNames) {
			for (const polyfill of allPolyfills) {
				if (polyfill.name === changed && polyfill.config.hasTests) {
					affectedPolyfills[polyfill.name] = polyfill;
				}
			}
		}

		modified.affectedPolyfills = affectedPolyfills;

		if (Object.keys(modified.affectedPolyfills).length > 50) {
			// 2.f. If there are too many changes it is better to run a full test suite for all polyfills.
			// We use a higher number than before as this is the resolved depedency list.
			modified.hasManyPolyfillChanges = true;
		}

		return modified;
	}).then((modified) => {
		// 3. Check all previous steps and set "testEverything" flag.

		if (modified.hasOtherChanges) {
			modified.testEverything = true;
			return modified;
		}

		if (modified.hasManyPolyfillChanges) {
			modified.testEverything = true;
			return modified;
		}

		if (!modified.affectedPolyfills || Object.keys(modified.affectedPolyfills).length === 0) {
			modified.testEverything = true;
			return modified;
		}

		return modified;
	});
}

function toposortPolyfills(polyfills) {
	const graph = [];

	for (const polyfill of polyfills) {
		for (const dependency of polyfill.dependencies) {
			graph.push([dependency, polyfill.name]);
		}
	}

	toposort(graph);

	return graph;
}
