// eslint-disable-next-line unicorn/prevent-abbreviations
"use strict";

const path = require('path');
const karmaPolyfillLibraryPlugin = require('./karma-polyfill-library-plugin');

const proclaim = path.resolve(require.resolve('proclaim'));
const fs = require('fs');

function getBrowsersFor(feature) {
	const UA = require('@financial-times/polyfill-useragent-normaliser');
	const TOML = require('@iarna/toml');
	// Grab all the browsers from BrowserStack which are officially supported by the polyfil service.
	const browserlist = TOML.parse(fs.readFileSync("./test/polyfills/browsers.toml", 'utf-8'));
	const browserstackBrowsers = TOML.parse(fs.readFileSync('./test/polyfills/browserstackBrowsers.toml', 'utf-8'));

	const browsersWeSupport = browserlist.browsers.filter(uaString => new UA(uaString).meetsBaseline());
	const browsersWeSupportForThisFeature = browsersWeSupport.filter(uaString => {
		const meta = TOML.parse(fs.readFileSync(path.resolve(__dirname, 'polyfills', feature, 'config.toml'), 'utf-8'));
		const ua = new UA(uaString);
		const isBrowserMatch = meta.browsers && meta.browsers[ua.getFamily()] && ua.satisfies(meta.browsers[ua.getFamily()]);
		return isBrowserMatch;
	});

	function useragentToBrowserObject(browserWithVersion) {
		const [browser, version] = browserWithVersion.split("/");
		const browserObject = browserstackBrowsers.browsers.find(browserObject => {
			if (browser === browserObject.os && version === browserObject.os_version) {
				return true;
			} else if (browser === browserObject.browser && version === browserObject.browser_version) {
				return true;
			} else {
				return false;
			}
		});

		if (browserObject) {
			return Object.assign({
				name: browserWithVersion.replace(/\//g, '-').replace(/\./g, '_'),
				base: 'BrowserStack'
			}, browserObject);
		} else {
			throw new Error(`Browser: ${browser} with version ${version} was not found on BrowserStack.`);
		}
	}

	const browsersWeSupportInBrowserStack = {};
	for (const browser of browsersWeSupportForThisFeature.map((element) => useragentToBrowserObject(element))) {
		browsersWeSupportInBrowserStack[browser.name] = browser;
	}

	return browsersWeSupportInBrowserStack;
}

function generateKarmaConfigTestFiles(config) {
	let features = config.features;
	features = features.split(',');
	features = features.map(feature => feature.trim());
	features = features.map(feature => feature.replace(/\./g, path.sep));
	features = features.map(feature => path.join(__dirname, './polyfills', feature, 'tests.js'));

	const featureTests = features.filter(feature => fs.existsSync(feature));

	return featureTests.map((element) => createKarmaFileObject(element));
}

function createKarmaFileObject(filePattern) {
	return {
		pattern: filePattern,
		included: true,
		served: true,
		watched: false
	};
}

module.exports = async function (config) {
	if (!config.features) {
		console.error('Missing the `--features` flag. `--features` needs to be set to the names of the features being tested. E.G. `npm run test-feature -- --features=Array.from,Array.prototype.forEach`');
		// eslint-disable-next-line unicorn/no-process-exit
		process.exit(1);
	}

	config.set({
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,
		browserDisconnectTimeout: 60 * 1000, // default 2000
		browserDisconnectTolerance: 5, // default 0
		browserNoActivityTimeout: 60 * 1000, // default 10000
		browserSocketTimeout: 60 * 1000, // default 20000
		// enable / disable colors in the output (reporters and logs)
		colors: true,
		// list of files / patterns to load in the browser
		files: [
			proclaim,
			...generateKarmaConfigTestFiles(config)
		],

		beforeMiddleware: ['polyfill-library'],

		// We need to add mocha after polyfill-library to ensure that the scripts loaded in the browser are in the correct order.
		// TODO: This is really a bug in the Symbol polyfill that we should fix, which is that it adds enumerable properties onto Object.prototype which gets exposed in `for (var o in {})`.
		frameworks: [
			"polyfill-library",
			"mocha"
		],
		reporters: ['mocha'],
		mochaReporter: {
			output: 'minimal'
		},

		// web server port
		port: 9876,

		plugins: [
			'karma-mocha',
			'karma-mocha-reporter',
			'karma-firefox-launcher',
			karmaPolyfillLibraryPlugin,
		],
		logLevel: config.LOG_WARN,
		client: {
			mocha: {
				opts: 'mocha.opts',
				// change Karma's debug.html to the mocha web reporter so we can see the test results in page instead of in the console
				reporter: 'html'
			}
		},
		// Run the tests inside a new window instead of in an iFrame
		useIframe: false
	});

	const features = config.features.split(',').map(feature => feature.trim());
	const feature = features[0];
	// eslint-disable-next-line unicorn/consistent-function-scoping
	const featureToFolder = feature => feature.replace(/\./g, path.sep);

	if (config.browserstack) {
		const browsers = getBrowsersFor(featureToFolder(feature));
		if (Object.keys(browsers).length === 0) {
			console.log('No browsers we support require this polyfill, not running the tests');
			// eslint-disable-next-line unicorn/no-process-exit
			process.exit(0);
		}
		config.set(Object.assign(config,{
			// if true, Karma captures browsers, runs the tests and exits
			singleRun: true,
			plugins: [...config.plugins,
				'karma-browserstack-launcher'
			],
			browserStack: {
				startTunnel: true,
				name: feature,
				project: 'polyfill-library',
				retryLimit: 10
			},
			reporters: [...config.reporters, 'BrowserStack'],
			summaryOptionalConsoleReporter: {
				// 'failed', 'skipped' or 'all'
				show: 'failed',
				// Limit the spec label to this length
				specLength: 50,
				// Show an 'all' column as a summary
				overviewColumn: false,
				// Print console log/error messages
				consoleLogs: true,
				// Print a summary line for each browser
				browserSummary: true
			},
			concurrency: 5,

			customLaunchers: browsers,

			browsers: Object.keys(browsers)
		}));
	}
};
