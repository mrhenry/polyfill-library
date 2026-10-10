'use strict';

const test = require('node:test');
const { describe, it, before, after } = test;

const assert = require('node:assert');
const vm = require('node:vm');

const apicache = require('apicache');
const { app } = require('./server.js');

let origin;
let server;

before(async () => {
	server = app.listen(0);
	await new Promise(resolve => server.once('listening', resolve));
	origin = `http://127.0.0.1:${server.address().port}`;
});

// apicache arms a timer per cache entry for the whole cache duration, which is
// a day here, so a test that touches a cached route would otherwise keep the
// test process alive for a day. clear() only empties the memory cache; the
// expiry timers are keyed and only clear(key) removes them.
after(() => {
	apicache.getIndex().all.forEach(key => apicache.clear(key));
	apicache.resetIndex();
	server.close();
});

const get = path => fetch(`${origin}${path}`);

const body = async path => (await get(path)).text();

const stats = async trace => {
	const response = await get(`/__trace-stats?inspect-trace=${trace}`);

	return JSON.parse(await response.text());
};

const scriptBlocks = html => [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
	.map(match => match[1]);

// The pages only publish what the driver polls through inline scripts, so the
// scripts are run rather than read: a rename cannot leave a test passing.
async function loadPage(path, sandbox = {}) {
	const html = await body(path);

	const context = {
		console,
		setTimeout,
		clearTimeout,
		document: { getElementById: () => null, createElement: () => ({}) },
		navigator: { userAgent: 'test agent' },
		parent: null,
		postMessage() {},
		...sandbox
	};

	context.window = context;

	vm.createContext(context);

	// A browser routes an uncaught script error to window.onerror rather than
	// abandoning the rest of the page, and a missing mocha.js is exactly the
	// case these tests cover.
	scriptBlocks(html).forEach(source => {
		try {
			vm.runInContext(source, context);
		} catch (error) {
			if (typeof context.onerror === 'function') {
				context.onerror(error.message, '', 0);
			} else {
				throw error;
			}
		}
	});

	return context;
}

function iframeStub() {
	return { src: '', appendChild() {}, contentWindow: {} };
}

describe('favicon', () => {
	it('answers instead of returning a 404', async () => {
		const response = await get('/favicon.ico');

		assert.equal(response.status, 204);
		await response.arrayBuffer();
	});

	// BrowserStack decides a session is dead by asking the test server whether
	// the browser asked for anything. A favicon request is not a navigation, so
	// counting it would make a session that never loaded the page look alive.
	it('is not counted as the browser asking for something', async () => {
		await get(`/favicon.ico?trace=favicon-probe`);

		assert.deepEqual(await stats('favicon-probe'), {
			trace: 'favicon-probe', requests: 0, gets: 0, paths: []
		});
	});
});

describe('trace correlation', () => {
	it('counts the browser\'s own GETs separately from BrowserStack\'s probe', async () => {
		await get('/?trace=mixed&includePolyfills=no');

		await fetch(`${origin}/?trace=mixed&includePolyfills=no`, { method: 'HEAD' });

		const seen = await stats('mixed');

		assert.equal(seen.requests, 2, 'both requests are recorded');
		assert.equal(seen.gets, 1, 'only the browser\'s GET counts as a navigation');
		assert.deepEqual(seen.paths, ['GET /', 'HEAD /']);
	});

	it('keeps separate traces separate', async () => {
		await get('/test?includePolyfills=no&trace=trace-a');
		await get('/iframe.html?includePolyfills=no&trace=trace-b');

		assert.deepEqual((await stats('trace-a')).paths, ['GET /test']);
		assert.deepEqual((await stats('trace-b')).paths, ['GET /iframe.html']);
	});

	it('reports nothing for a trace it never saw', async () => {
		assert.deepEqual(await stats('never-requested'), {
			trace: 'never-requested', requests: 0, gets: 0, paths: []
		});
	});

	it('ignores a trace that is not a plain id', async () => {
		const response = await get('/__trace-stats?inspect-trace=' + encodeURIComponent('<script>'));

		assert.deepEqual(JSON.parse(await response.text()), {
			trace: null, requests: 0, gets: 0, paths: []
		});
	});

	// Each job carries its own id on every sub-resource it asks for, which
	// would otherwise give every job its own cache entry. That turns one cached
	// polyfill bundle into one per browser.
	it('is stripped before the cache sees the URL', async () => {
		const key = '/empty-document.html$$appendKey=NaN';

		await get('/empty-document.html?trace=cache-1');
		await get('/empty-document.html?trace=cache-2');
		await get('/empty-document.html?trace=cache-3');

		assert.deepEqual(
			apicache.getIndex().all.filter(entry => entry.startsWith('/empty-document.html')),
			[key],
			'three jobs, one cache entry'
		);

		// This is the only cached route any test touches, and its entry is
		// dropped by name rather than by emptying the index, which would
		// orphan the timers belonging to everything else.
		apicache.clear(key);
	});
});

describe('the test page', () => {
	it('refuses an includePolyfills it cannot serve', async () => {
		const response = await get('/test?includePolyfills=maybe');

		assert.equal(response.status, 400);
		assert.match(await response.text(), /includePolyfills/);
	});

	it('refuses an always it cannot serve', async () => {
		const response = await get('/test?always=perhaps');

		assert.equal(response.status, 400);
		assert.match(await response.text(), /always/);
	});
});

describe('the runner page', () => {
	// The driver cannot tell the director page from the runner page by which
	// globals exist, because the director keeps mocha inside an iframe. Both
	// pages declare themselves, and the driver asserts it got the page it
	// asked for.
	function runnerPage(mocha) {
		return loadPage('/test?includePolyfills=no&always=no&trace=runner-probe', { mocha });
	}

	function stubMocha(suiteSize) {
		const handlers = {};

		return {
			handlers,
			mocha: {
				setup() {},
				suite: { total: () => suiteSize },
				run: () => ({ on: (event, handler) => { handlers[event] = handler; } })
			}
		};
	}

	it('declares its identity and its suite size', async () => {
		const { mocha } = stubMocha(314);
		const page = await runnerPage(mocha);

		assert.equal(page.global_test_page, 'runner');
		assert.equal(page.global_test_started, true);
		assert.equal(page.global_test_suite_size, 314, 'the parsed suite says the test script arrived');
	});

	// Without mocha.js the page has no suite at all, which the driver has to be
	// able to tell from a suite that is still being defined.
	it('reports a suite size of zero when mocha never loaded', async () => {
		const page = await loadPage('/test?includePolyfills=no&always=no');

		assert.equal(page.global_test_suite_size, 0);
		assert.equal(page.global_test_started, true);
		assert.match(page.global_test_assets.errors.join(' '), /mocha is not defined/);
	});

	it('records which scripts loaded, failed or threw', async () => {
		const page = await runnerPage(stubMocha(1).mocha);

		page.__assetLoaded('mocha.js');
		page.__assetFailed('polyfill.test.js');

		assert.deepEqual(page.global_test_assets.loaded, ['mocha.js']);
		assert.deepEqual(page.global_test_assets.failed, ['polyfill.test.js']);

		assert.equal(page.onerror('is not defined', 'http://bs-local.com:9876/test', 12), true);
		assert.match(page.global_test_assets.errors[0], /is not defined @ http:\/\/bs-local\.com:9876\/test:12/);
	});

	// A suite that registered nothing reports passed:0 failed:0, which scores
	// as a success. That is what a failed polyfill.test.js used to look like.
	it('fails a run that registered no tests, and names the asset', async () => {
		const { mocha, handlers } = stubMocha(0);
		const page = await runnerPage(mocha);

		page.__assetFailed('polyfill.test.js');

		handlers.end();

		const results = page.window.global_test_results;

		assert.equal(results.failed, 1, 'an empty suite is not a pass');
		assert.equal(results.passed, 0);
		assert.match(results.tests[0].message, /polyfill\.test\.js/);
	});

	it('still passes a suite that ran', async () => {
		const { mocha, handlers } = stubMocha(2);
		const page = await runnerPage(mocha);

		handlers.pass({});
		handlers.pass({});
		handlers.end();

		const results = page.window.global_test_results;

		assert.equal(results.passed, 2);
		assert.equal(results.failed, 0);
	});
});

describe('the director page', () => {
	// The director arms a 30s timer per feature and re-arms it on every
	// timeout, so a test that leaves one pending keeps rescheduling forever.
	async function directorPage(t, features) {
		const page = await loadPage(
			`/?includePolyfills=no&always=no&feature=${features}&trace=director-probe`,
			{ document: { getElementById: () => iframeStub(), createElement: () => ({}) } }
		);

		t.after(() => clearTimeout(page.timer));

		return page;
	}

	it('declares its identity, and how many runs it intends to do', async t => {
		const page = await directorPage(t, 'Promise,fetch');

		page.onload();

		assert.equal(page.global_test_page, 'director');
		assert.equal(page.global_test_started, true);
		assert.equal(page.global_test_expected_runs, 2);
	});

	// Every request a browser makes is attributed by its trace, which is only
	// useful if the director passes it on to the pages it loads.
	it('asks the test server for each feature with its own trace', async t => {
		const page = await directorPage(t, 'Promise,fetch');

		page.onload();

		assert.match(page.runner.src, /^\/test\?/);
		assert.match(page.runner.src, /trace=director-probe/);
		assert.match(page.runner.src, /feature=Promise$/);
	});

	it('hands the iframe\'s asset diagnostics to the window the driver polls', async t => {
		const page = await directorPage(t, 'Promise');

		page.onload();

		const assets = { loaded: ['mocha.js'], failed: ['polyfill.test.js'], errors: [] };

		page.receiveTestResults(['Promise'], {
			passed: 4, failed: 0, total: 4, testedSuites: ['Promise'], assets
		});

		assert.deepEqual(page.global_test_results.assets, assets);
	});

	// On the timeout path the iframe never reported results, so the director
	// reads the iframe's own record to turn "Timeout waiting for results" into
	// a named asset.
	it('reads the iframe diagnostics when a feature times out', async t => {
		const page = await directorPage(t, 'Promise');

		page.onload();

		page.runner.contentWindow.global_test_assets = {
			loaded: [], failed: ['polyfill.js'], errors: []
		};

		// The first two timeouts are retried; the third gives up and reports.
		for (let attempt = 0; attempt < 3; attempt++) {
			page.receiveTestResults(['Promise']);
		}

		assert.equal(page.global_test_results.failed, 1);
		assert.deepEqual(page.global_test_results.assets.failed, ['polyfill.js']);
	});
});

describe('the test iframe', () => {
	it('loads the polyfills with the trace it was given', async () => {
		const html = await body('/iframe.html?includePolyfills=no&always=no&trace=iframe-probe');

		const [, src] = /<script src="([^"]+)"/.exec(html);

		assert.match(src, /^\/polyfill\.js\?/);
		assert.match(src, /trace=iframe-probe/);
	});
});