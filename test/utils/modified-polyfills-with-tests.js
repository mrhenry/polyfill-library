const exec = require('child_process').exec;
const path = require('path');
const toposort = require('toposort');
const polyfillio = require('../../lib');

module.exports = modifiedPolyfillsWithTests;

/**
 * Get a list of polyfills that have changes when compared against master.
 * Also includes a list of polyfills that should be tested again.
 */
async function modifiedPolyfillsWithTests() {
	const polyfillsDirectory = path.join(process.cwd(), 'polyfills');

	const modified = {
		polyfills: {},
		hasOtherChanges: false,
		hasManyPolyfillChanges: false
	};
	
	// 1. Check git to see which files changed.
	const modifiedFiles = await getModifiedFiles();
	if (modifiedFiles.length === 0) {
		modified.testEverything = true; // no detectable changes, best to test everything anyway.
		return modified;
	}

	// 2. Get all polyfill meta data.
	const allPolyfills = await polyfillio.listAllPolyfills();
	const polyfillMetas = {};
	for (const polyfillName of allPolyfills) {
		polyfillMetas[polyfillName] = await polyfillio.describePolyfill(polyfillName);
	}

	// 3. Analyse the modified files for change in polyfills.
	for (const modifiedFilePath of modifiedFiles) {
		// 3.a. Check if the changed file is for a polyfill or not.

		if (!modifiedFilePath.startsWith('polyfills/')) {
			modified.hasOtherChanges = true;
			modified.testEverything = true;
			continue;
		}

		// 3.b. It likely is a polyfill, so check the path and locate it in the library.

		const polyfillPath = path.dirname(modifiedFilePath);
		const absolute = path.join(process.cwd(), polyfillPath);
		if (absolute === polyfillsDirectory) {
			// 3.b.I. This is a file directly in the "polyfills" directory. (e.g. '.eslintrc')
			modified.hasOtherChanges = true;
			modified.testEverything = true;
			continue;
		}

		const relative = path.relative(polyfillsDirectory, absolute);
		const polyfillName = relative.replace(/(\/|\\)/g, '.');
		if (!polyfillMetas[polyfillName]) {
			// 3.b.II. Polyfill was not found in the library. (this should never happen)
			modified.hasOtherChanges = true;
			modified.testEverything = true;
			continue;
		}

		// 3.b.III. This is a change to a known polyfill. Add it to the list of modified polyfills.
		modified.polyfills[polyfillName] = polyfillMetas[polyfillName];
	}

	if (modified.testEverything) {
		// 4. If we already detected changes unrelated to polyfills we stop early.
		return modified;
	}

	if (Object.keys(modified.polyfills).length === 0) {
		// 5. There seem to be no changes inside or outside the polyfills directory. Test everything to be sure.
		modified.testEverything = true;
		return modified;
	}

	if (Object.keys(modified.polyfills).length > 20) {
		// 6. If there are too many polyfill changes it is better to run a full test suite for all polyfills.
		modified.hasManyPolyfillChanges = true;
		modified.testEverything = true;
		return modified;
	}

	// 7. Collect all dependants of modified polyfills.

	// 7.a Start by adding the directly modified polyfills to a new record set.
	const changedNames = {};
	for (const polyfillName in modified.polyfills) {
		changedNames[polyfillName] = true;

		const polyfill = modified.polyfills[polyfillName];
		if (polyfill.aliases) {
			for (const alias of polyfill.aliases) {
				changedNames[alias] = true;
			}
		}
	}

	// 7.b. Apply toposort to all polyfills.
	const toposortedPolyfills = toposortPolyfills(polyfillMetas);

	// 7.c. Check all polyfills for dependants.

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

	// 7.d. Construct a record set with all affected Polyfills.
	const affectedPolyfills = {};
	for (const changed in changedNames) {
		for (const polyfill of allPolyfills) {
			if (polyfill.name === changed && polyfill.hasTests) {
				affectedPolyfills[polyfill.name] = polyfill;
			}
		}
	}

	modified.affectedPolyfills = affectedPolyfills;

	if (Object.keys(modified.affectedPolyfills).length > 50) {
		// 7.e. If there are too many changes it is better to run a full test suite for all polyfills.
		// We use a higher number than before as this is the resolved depedency list.
		modified.hasManyPolyfillChanges = true;
		modified.testEverything = true;
		return modified;
	}

	return modified;
}

function toposortPolyfills(polyfillMetas) {
	const graph = [];

	for (const polyfillName in polyfillMetas) {
		const meta = polyfillMetas[polyfillName];
		if (meta.dependencies) {
			for (const dependency of meta.dependencies) {
				graph.push([dependency, polyfillName]);
			}
		}
	}

	toposort(graph);

	return graph;
}

function getModifiedFiles() {
	return new Promise((resolve, reject) => {
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

			resolve(list);
		});
	});
}
