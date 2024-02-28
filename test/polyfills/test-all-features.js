"use strict";

const path = require('path');
const execa = require('execa');
const glob = require('glob');

(async function () {
	let feature;
	try {
		// This turns ./polyfills/Array/from/tests.js into Array.from, which is the format that the Karma config accepts in the `--features` flag.
		const polyfillsWhichHaveTests = glob.sync('polyfills/**/tests.js', { ignore: ['polyfills/__dist/**'] }).map((entry) => entry.replace('polyfills/', '').replace('/tests.js', '').replace(/\//g, '.'));
		for (feature of polyfillsWhichHaveTests) {
			console.log(`Testing ${feature}`);
			const result = execa('karma', ['start', path.join(__dirname, '../../', 'karma.conf.js'), `--browserstack`, `--features=${feature}`], {
				preferLocal: true
			});
			result.stdout.pipe(process.stdout);
			result.stderr.pipe(process.stderr);
			await result;
		}
	} catch (error) {
		console.log(`Errors found testing ${feature}`);
		console.error(error.stderr || error.stdout);
		console.log(`Errors found testing ${feature}`);
		// eslint-disable-next-line unicorn/no-process-exit
		process.exit(1);
	}
}());
