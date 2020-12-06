/* eslint-env mocha, browser */
/* global proclaim */

// Minimal test to ensure that fetch is included in CI
// TODO : real tests
it('exists', function () {
	proclaim.ok('fetch' in self);
});
