"use strict";

require("hard-rejection/register");
const semver = require("semver");
const polyfillio = require('../../lib');
const fs = require("node:fs");
const promisify = require("node:util").promisify;
const readFile = promisify(fs.readFile);
const path = require("node:path");
const handlebars = require("handlebars");
const ua_parser = require('./ua-parser');

process.title = "polyfill-library-test-server";

const directorTemplate = handlebars.compile(
	fs.readFileSync(path.join(__dirname, "./test-director.handlebars"), {
		encoding: "UTF-8"
	})
);
const runnerTemplate = handlebars.compile(
	fs.readFileSync(path.join(__dirname, "./test-runner.handlebars"), {
		encoding: "UTF-8"
	})
);
const testIframeTemplate = handlebars.compile(
	fs.readFileSync(path.join(__dirname, "./test-iframe.handlebars"), {
		encoding: "UTF-8"
	})
);

function createPolyfillLibraryConfigFor(features, always) {
	const config = {};
	const flags = new Set(always ? ["always", "gated"] : []);
	for (const feature of features.split(",")) {
		config[feature] = { flags };
	}

	return config;
}

const compression = require('compression');
const express = require("express");

const app = express();
app.use(compression());

{
	// Correlation id.
	//
	// The driver appends `trace=<run>-<job>` to the test page URL, and the page
	// templates carry it onto every sub-resource, so each request a browser makes
	// can be attributed to the job that caused it. Without it the only way to
	// correlate a failure with the server log is by timestamp, which is ambiguous
	// when sessions overlap.
	//
	// The id is stripped from the URL before the cache middleware sees it, so
	// per-request ids do not defeat caching.
	const traceParam = "trace";
	const inspectTraceParam = "inspect-trace";
	const tracePattern = /^[A-Za-z0-9._-]{1,80}$/;
	const traces = new Map();
	const maxTraces = 4096;

	function readTrace(value) {
		if (typeof value !== "string" || !tracePattern.test(value)) {
			return null;
		}

		return value;
	}

	function traceRequests(request) {
		const trace = request.trace;

		if (!trace) {
			return;
		}

		let entry = traces.get(trace);

		if (!entry) {
			if (traces.size >= maxTraces) {
				traces.clear();
			}

			entry = { requests: 0, gets: 0, paths: [] };
			traces.set(trace, entry);
		}

		entry.requests += 1;

		// BrowserStack probes the session URL with a HEAD on its own user agent, so
		// the GET count is what shows the browser itself made a request.
		if (request.method === "GET") {
			entry.gets += 1;
		}

		if (entry.paths.length < 20) {
			entry.paths.push(request.method + " " + request.path);
		}
	}

	app.get("/__trace-stats", (request, response) => {
		const trace = readTrace(request.query[inspectTraceParam]);
		const entry = traces.get(trace);

		response.set("cache-control", "no-store");

		response.json({
			trace: trace,
			requests: entry ? entry.requests : 0,
			gets: entry ? entry.gets : 0,
			paths: entry ? entry.paths : [],
		});
	});

	app.use((request, _response, next) => {
		const trace = readTrace(request.query[traceParam]);

		if (trace === null) {
			next();
			return;
		}

		request.trace = trace;

		// apicache keys on req.originalUrl (falling back to req.url) and offers no
		// way to override it, so the parameter is removed here instead.
		for (const property of ["originalUrl", "url"]) {
			const value = request[property];

			if (typeof value !== "string") {
				continue;
			}

			const parsed = new URL(value, "http://localhost");
			parsed.searchParams.delete(traceParam);

			const search = parsed.searchParams.toString();

			request[property] = parsed.pathname + (search ? "?" + search : "");
		}

		traceRequests(request);

		next();
	});
}

const port = 9876;
const apicache = require('apicache');
const cache = apicache.middleware;

const cacheFor1Day = cache("1 day", () => true, {
	appendKey: request => {
		let key =
			request.query.feature +
			request.query.includePolyfills +
			request.query.always;
		if (request.query.always === "no") {
			const ua = request.get("User-Agent");
			key += ua_parser(ua).normalize();
		}
		return key;
	}
});

app.get(["/test"], createEndpoint(runnerTemplate));
app.get(["/iframe.html"], createEndpoint(testIframeTemplate));

app.get("/favicon.ico", (request, response) => {
	response.set("cache-control", "public, max-age=86400");
	response.status(204).end();
});

app.get(["/empty-document.html"], cacheFor1Day, (request, response) => {
	response.sendFile(path.resolve(__dirname, "./empty-document.html"));
});
app.get(["/"], createEndpoint(directorTemplate));
app.get("/mocha.js", cacheFor1Day,(request, response) => {
	response.sendFile(path.resolve(__dirname, "./mocha/mocha.min.js"));
});
app.get("/mocha.css", cacheFor1Day, (request, response) => {
	response.sendFile(path.resolve(__dirname, "./mocha/mocha.css"));
});
app.get("/proclaim.js", cacheFor1Day, (request, response) => {
	response.sendFile(require.resolve("proclaim/lib/proclaim.js"));
});

app.get(
	"/polyfill.js",
	cacheFor1Day,
	async (request, response) => {
		const polyfillCombinations = (request.query.polyfillCombinations || "no") === "yes";
		const feature = request.query.feature || "";
		const includePolyfills = request.query.includePolyfills || "no";
		const always = request.query.always || "no";

		const headers = {
			"Content-Type": "text/javascript; charset=utf-8"
		};
		response.status(200);
		response.set(headers);

		if (includePolyfills === "yes") {
			const polyfillsWithTests = await testablePolyfills();
			let features = polyfillsWithTests.map(polyfill => polyfill.feature);

			// Exclude polyfills which must not be loaded together
			if (polyfillCombinations) {
				// "timeZone.golden" and "timeZone.all" overlap.
				// Including both is a user error.
				features = features.filter((x) => {
					return x !== 'Intl.DateTimeFormat.~timeZone.golden';
				})
			}

			const parameters = {
				features: createPolyfillLibraryConfigFor(
					(feature && !polyfillCombinations) ? feature : features.join(","),
					always === "yes"
				),
				minify: false,
				stream: false,
				ua: ua_parser(always === "yes" ? "other/0.0.0" : request.get("user-agent"))
			};

			const bundle = await polyfillio.getPolyfillString(parameters);
			response.send(bundle);
		} else {
			response.send("");
		}
	}
);

app.get(
	"/polyfill.test.js",
	cacheFor1Day,
	async (request, response) => {
		const feature = request.query.feature;
		const requestedFeature = request.query.feature !== undefined;

		const headers = {
			"Content-Type": "text/javascript; charset=utf-8"
		};
		response.status(200);
		response.set(headers);

const polyfills = await testablePolyfills();

		// Filter for querystery args
		const features = requestedFeature
			? polyfills.filter(polyfill => feature && feature.split(',').includes(polyfill.feature))
			: polyfills;

		response.send(features.map(feature => feature.testSuite).join("\n"));
	}
);

app.get(
	"/sleep",
	async (request, response) => {
		const duration = Math.max(Number.parseInt(request.query.d), 1000);
		await new Promise((resolve) => setTimeout(resolve, duration));

		response.status(200);
		response.send("");
	}
);

app.listen(port, () => console.log(`Test server listening on port ${port}!`));

const testablePolyfillsCache = {};

// Every polyfill's metadata and test file is read once, not once per browser.
//
// describePolyfill() re-reads meta.json from disk on every call, and
// testablePolyfills() calls it for all ~3400 polyfills once per distinct
// user agent. A 49 browser matrix entry therefore caused ~168k metadata
// reads, all on the event loop that also has to serve the remote browsers,
// which is enough to stall the pages that are already running.
const polyfillSourcesPromise = (async () => {
	const polyfills = await polyfillio.listAllPolyfills();

	return Promise.all(
		polyfills.map(async polyfill => {
			const config = await polyfillio.describePolyfill(polyfill);

			if (!config || !config.isTestable || !config.isPublic || !config.hasTests) {
				return null;
			}

			const baseDirectory = path.resolve(__dirname, "../../polyfills");
			const testFile = path.join(baseDirectory, config.baseDir, "/polyfill.test.js");

			return {
				feature: polyfill,
				browsers: config.browsers || {},
				testSuite: `describe('${polyfill}', function() {
					it('passes the feature detect', function() {
						proclaim.ok((function() {
							return (${config.detectSource || 'false'});
						}).call(window));
					});

					${await readFile(testFile)}
				});`
			};
		})
	).then(entries => entries.filter(Boolean));
})();

async function testablePolyfills(ua) {
	if (testablePolyfillsCache[`ua:${ua}`]) {
		return testablePolyfillsCache[`ua:${ua}`];
	}

	const allSources = await polyfillSourcesPromise;

	const polyfillData = [];

	for (const source of allSources) {
		if (ua) {
			const [family, version] = ua.split('/');
			// A polyfill is only exercised by the browsers it targets.
			if (!source.browsers[family] || !semver.satisfies(version, source.browsers[family])) {
				continue;
			}
		}

		polyfillData.push({
			feature: source.feature,
			testSuite: source.testSuite
		});
	}

	polyfillData.sort(function (a, b) {
		// console.clear() test must run first to preserve console output of other tests.
		// to run first it must be last in the list.
		if (a.feature === 'console.clear') {
			return 1;
		}

		if (b.feature === 'console.clear') {
			return -1;
		}

		return a.feature > b.feature ? -1 : 1;
	});

	testablePolyfillsCache[`ua:${ua}`] = polyfillData;
	return polyfillData;
}

function createEndpoint(template) {
	return async (request, response) => {
		const ua = request.get("User-Agent");
		const featuresArgument = (request.query.feature || "").split(',').filter((feature) => !!feature);
		const includePolyfills = request.query.includePolyfills || "no";
		const polyfillCombinations = request.query.polyfillCombinations || "no";
		const shard = request.query.shard || false;
		const always = request.query.always || "no";

		if (includePolyfills !== "yes" && includePolyfills !== "no") {
			response.status(400);
			response.send(
				"includePolyfills query parameter is an invalid value, it can only be 'yes' or 'no'."
			);
			return;
		}

		if (always !== "yes" && always !== "no") {
			response.status(400);
			response.send(
				"always query parameter is an invalid value, it can only be 'yes' or 'no'."
			);
			return;
		}
		let polyfills;
		if (includePolyfills === 'yes' && always === 'no') {
			polyfills = await testablePolyfills(ua_parser(ua).normalize());
		} else {
			polyfills = await testablePolyfills();
		}

		// Filter for querystring args
		let features = (featuresArgument.length > 0)
			? polyfills.filter(polyfill => {
				return featuresArgument.includes(polyfill.feature);
			})
			: polyfills;

		// Make sure we always test something.
		// This catches edge cases were a run is requested for a polyfill that isn't required for the current UA.
		if (features.length === 0) {
			features = polyfills;
		}

		response.status(200);

		if (shard) {
			features = features.slice((shard - 1) * (features.length / 2), (shard) * (features.length / 2));
		}

		response.set({
			"Content-Type": "text/html; charset=utf-8"
		});

		response.send(
			template({
				requestedFeature: features.length > 0,
				features: features.map(f => f.feature).join(','),
				includePolyfills: includePolyfills,
				requestedPolyfillCombinations: polyfillCombinations === 'yes',
				polyfillCombinations: polyfillCombinations,
				always: always,
				trace: request.trace || "",
				afterTestSuite: `
				// Declare what this page is before running anything, so the
				// driver can tell the runner page apart from the director page
				// instead of inferring it from which globals happen to exist.
				window.global_test_page = 'runner';

				// ${JSON.stringify(features.map(f => f.feature))} is loaded and parsed by the time this
				// inline script runs, so the suite size says whether the test
				// script itself arrived intact.
				window.global_test_suite_size = (typeof mocha !== 'undefined' && mocha.suite) ? mocha.suite.total() : 0;
				window.global_test_started = true;

				// During the test run, surface the test results in Browserstack their preferred format
				function run() {
					// Given a test, get the first level suite that it is contained within
					// Not the top level, the first one down.
					function getFirstLevelSuite(test) {
						var parent = test;
						while (parent && parent.parent && parent.parent.parent) {
							parent = parent.parent;
						}
						return parent.title;
					}
					var runner = mocha.run();
					var results = {
						state: 'complete',
						passed: 0,
						failed: 0,
						total: 0,
						duration: 0,
						tests: [],
						failingSuites: {},
						testedSuites: [],
						assets: window.global_test_assets,
						uaString: window.navigator.userAgent || 'unknown'
					};

					runner.on('pass', function() {
						results.passed++;
						results.total++;
					});
					runner.on('fail', function(test, err) {
						// Get a set of all the suites with failing tests in them.
						if (test.parent) {
							results.failingSuites[getFirstLevelSuite(test)] = true;
						}
						results.failed++;
						results.total++;
						results.tests.push({
							name: test.fullTitle(),
							result: false,
							message: err.message,
							stack: err.stack,
							failingSuite: getFirstLevelSuite(test)
						});
					});
					runner.on('suite', function(suite) {
						results.testedSuites.push(getFirstLevelSuite(suite));
					});
					runner.on('end', function() {
						// A suite that registered no tests used to be reported
						// as passed:0 failed:0, which every driver scored as a
						// success. That happens when polyfill.test.js fails to
						// load or throws before calling describe, so record it
						// as a failure and name the asset that broke.
						if (!results.total) {
							results.failed = 1;
							results.total = 1;
							results.failingSuites['(test suite did not load)'] = true;
							results.tests.push({
								name: '(test suite did not load)',
								result: false,
								message: 'no tests were registered. Assets failed: [' +
									(window.global_test_assets ? window.global_test_assets.failed.join(', ') : 'unknown') +
									']. Errors: [' +
									(window.global_test_assets ? window.global_test_assets.errors.join(' | ') : 'unknown') +
									']',
								stack: '',
								failingSuite: '(test suite did not load)'
							});
						}
						window.global_test_results = results;
						if (parent && parent.receiveTestResults) {
							var flist = ${JSON.stringify(features.map(f => f.feature))};
							parent.receiveTestResults(flist, results);
						}
					});
				}
				run();`
			})
		);
	};
}
