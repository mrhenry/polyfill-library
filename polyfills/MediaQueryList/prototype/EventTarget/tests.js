/* eslint-env mocha, browser */
/* global proclaim */

it("should define the EventTarget methods on the MediaQueryList prototype", function() {
	proclaim.ok('addEventListener' in MediaQueryList.prototype);
	proclaim.ok('removeEventListener' in MediaQueryList.prototype);
	proclaim.ok('dispatchEvent' in MediaQueryList.prototype);
});
