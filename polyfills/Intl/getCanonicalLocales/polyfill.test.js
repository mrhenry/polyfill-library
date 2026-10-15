/* globals Intl */

describe('Intl.getCanonicalLocales', function () {
	it('should be able to resolve locale list', function () {
		proclaim.deepEqual(Intl.getCanonicalLocales('en'), ['en']);
	});
});
