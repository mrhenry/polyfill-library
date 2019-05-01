/* eslint-env mocha, browser */
/* global proclaim */

describe('inert', function () {
	var element;

	beforeEach(function() {
		element = document.createElement('div');
		element.innerHTML = '<h1 id="inert-tests-present" inert></h1><h1 id="inert-tests-empty"></h1>';
		document.body.appendChild(element);
	});

	afterEach(function() {
		document.body.removeChild(element);
	});

	it('get', function () {
		var el = document.getElementById('inert-tests-present');

		proclaim.equal(el.inert, true);

		el = document.getElementById('inert-tests-empty');

		proclaim.equal(el.inert, false);
	});

	it('set', function () {
		var el = document.getElementById('inert-tests-present');
		el.inert = false;

		proclaim.equal(el.inert, false);
		proclaim.equal(el.getAttribute('inert'), '');
	});
});
