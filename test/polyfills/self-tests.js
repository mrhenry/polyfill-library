// Self tests for the BrowserStack harness itself.
//
// These are deliberately not polyfills. They live outside polyfills/ so they
// are never built into polyfills/__dist, never published, and never appear in
// the library's feature list. server.js appends them to every test page, in
// every browser and every test mode, so they run alongside whatever feature is
// under test.
//
// Two controls:
//
//   - one that must pass, which proves the page really executed tests and that
//     results reached the harness. If it fails, the run is telling you nothing
//     about the feature under test.
//   - one that must fail, which proves failures are counted rather than
//     swallowed. If it passes, every other result on the page is worthless,
//     because the harness cannot see a failure at all.
//
// Neither uses the test framework's assertion library, so a failure to load
// proclaim or mocha shows up as a failing control rather than a control that
// silently passes.
//
// ES3 only: this runs on IE 9 and Chrome 14.

describe('polyfill-library self test', function () {
	it('reports passing tests', function () {
		// Nothing here can fail in a working browser. The value is that this
		// test produces a pass event at all: if the suite did not execute, or
		// the page could not report results, this control will not pass.
		if (typeof describe !== 'function') {
			throw new Error('the test framework is not available');
		}

		if (typeof document !== 'object') {
			throw new Error('there is no document');
		}
	});

	it('reports failing tests', function () {
		throw new Error(
			'this self test must always fail; if it passed, the harness is not detecting failures'
		);
	});
});