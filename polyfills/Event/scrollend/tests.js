/* eslint-env mocha, browser */
// eslint-disable-next-line no-unused-vars
/* globals proclaim */

describe('Event.scrollend', function () {
	var el;

	before(function () {
		el = document.body.appendChild(document.createElement("div"));
		el.style = "height: 10000px; overflow: auto;";
		var content = document.createElement("div");
		content.style = "height: 20000px;";
		el.appendChild(content);
	});

	after(function () {
		document.body.removeChild(el);
	});

	afterEach(function () {
		el.scrollTo(0, 0);
		window.scrollTo(0, 0);
	});

	it('is a function', function () {
		proclaim.isTypeOf(Element.prototype.addEventListener, 'function');
		proclaim.isTypeOf(Element.prototype.removeEventListener, 'function');

		proclaim.isTypeOf(el.addEventListener, 'function');
		proclaim.isTypeOf(el.removeEventListener, 'function');

		proclaim.isTypeOf(document.addEventListener, 'function');
		proclaim.isTypeOf(document.removeEventListener, 'function');

		proclaim.isTypeOf(window.addEventListener, 'function');
		proclaim.isTypeOf(window.removeEventListener, 'function');
	});

	it('has correct arity', function () {
		proclaim.arity(Element.prototype.addEventListener, 2);
		proclaim.arity(Element.prototype.removeEventListener, 2);

		proclaim.arity(el.addEventListener, 2);
		proclaim.arity(el.removeEventListener, 2);

		proclaim.arity(document.addEventListener, 2);
		proclaim.arity(document.removeEventListener, 2);

		proclaim.arity(window.addEventListener, 2);
		proclaim.arity(window.removeEventListener, 2);
	});

	it('has correct name', function () {
		proclaim.hasName(Element.prototype.addEventListener, 'addEventListener');
		proclaim.hasName(Element.prototype.removeEventListener, 'removeEventListener');

		proclaim.hasName(el.addEventListener, 'addEventListener');
		proclaim.hasName(el.removeEventListener, 'removeEventListener');

		proclaim.hasName(document.addEventListener, 'addEventListener');
		proclaim.hasName(document.removeEventListener, 'removeEventListener');

		proclaim.hasName(window.addEventListener, 'addEventListener');
		proclaim.hasName(window.removeEventListener, 'removeEventListener');
	});

	it('fires a scrollend event when the user has stopped scrolling in an element', function (done) {
		var listener = function listener() {
			done();
			el.removeEventListener('scrollend', listener);
		};

		el.addEventListener('scrollend', listener);
		el.scrollTop = 10000;
	});

	it('fires a scrollend event when the user has stopped scrolling in the document', function (done) {
		var listener = function listener() {
			done();
			document.removeEventListener('scrollend', listener);
		};

		document.addEventListener('scrollend', listener);
		window.scrollTo(0, 10000);
	});

	it('fires a scrollend event when the user has stopped scrolling in the window', function (done) {
		var listener = function listener() {
			done();
			window.removeEventListener('scrollend', listener);
		};

		window.addEventListener('scrollend', listener);
		window.scrollTo(0, 10000);
	});

	it('removes listeners on elements', function (done) {
		var counter = 0;
		var listener = function listener() {
			counter++;
		};

		el.addEventListener('scrollend', listener);
		el.removeEventListener('scrollend', listener);
		el.scrollTop = 10000;

		setTimeout(function () {
			if (counter === 0) {
				done();
				return;
			}

			throw new Error('Listener was not removed');
		}, 200);
	});

	it('removes listeners on the document', function (done) {
		var counter = 0;
		var listener = function listener() {
			counter++;
		};

		document.addEventListener('scrollend', listener);
		document.removeEventListener('scrollend', listener);
		window.scrollTo(0, 10000);

		setTimeout(function () {
			if (counter === 0) {
				done();
				return;
			}

			throw new Error('Listener was not removed');
		}, 200);
	});

	it('removes listeners on the window', function (done) {
		var counter = 0;
		var listener = function listener() {
			counter++;
		};

		window.addEventListener('scrollend', listener);
		window.removeEventListener('scrollend', listener);
		window.scrollTo(0, 10000);

		setTimeout(function () {
			if (counter === 0) {
				done();
				return;
			}

			throw new Error('Listener was not removed');
		}, 200);
	});

	it('fires a scrollend event added in scroll for element', function (done) {
		var listener = function listener() {
			done();
			el.removeEventListener('scrollend', listener);
		};

		var listener2 = function listener2() {
			el.addEventListener('scrollend', listener);
			el.removeEventListener('scroll', listener2);
		};

		el.addEventListener('scroll', listener2);
		el.scrollTop = 10000;
	});

	it('fires a scrollend event added in scroll for document', function (done) {
		var listener = function listener() {
			done();
			document.removeEventListener('scrollend', listener);
		};

		var listener2 = function listener2() {
			document.addEventListener('scrollend', listener);
			document.removeEventListener('scroll', listener2);
		};

		document.addEventListener('scroll', listener2);
		window.scrollTo(0, 10000);
	});

	it('fires a scrollend event added in scroll for window', function (done) {
		var listener = function listener() {
			done();
			window.removeEventListener('scrollend', listener);
		};

		var listener2 = function listener2() {
			window.addEventListener('scrollend', listener);
			window.removeEventListener('scroll', listener2);
		};

		window.addEventListener('scroll', listener2);
		window.scrollTo(0, 10000);
	});

	it('correctly keeps track of event listeners - a', function (done) {
		var counter = 0;
		var listener = function listener() {
			counter++;
		};

		var listener2 = function listener2() {
			el.addEventListener('scrollend', listener);
			el.addEventListener('scrollend', listener);
			el.removeEventListener('scroll', listener2);
			el.addEventListener('scrollend', listener);
		};

		el.removeEventListener('scroll', listener2);
		el.removeEventListener('scrollend', listener);
		el.addEventListener('scroll', listener2);
		el.addEventListener('scroll', listener2);
		el.scrollTop = 10000;

		setTimeout(function () {
			if (counter === 1) {
				done();
				return;
			}

			throw new Error('Listener was not removed');
		}, 300);
	});

	it('correctly keeps track of event listeners - b', function (done) {
		var counter = 0;
		var listener = function listener() {
			counter++;
		};

		var listener2 = function listener2() {
			el.addEventListener('scrollend', listener);
		};

		el.addEventListener('scroll', listener2);
		el.addEventListener('scrollend', listener);
		el.addEventListener('scroll', listener2);
		el.addEventListener('scrollend', listener);
		el.removeEventListener('scroll', listener2);
		el.removeEventListener('scrollend', listener);
		el.scrollTop = 10000;

		setTimeout(function () {
			if (counter === 0) {
				done();
				return;
			}

			throw new Error('Listener was not removed');
		}, 300);
	});

	it('correctly keeps track of event listeners - c', function (done) {
		var listener = function listener() {
			done();
			el.removeEventListener('scrollend', listener);
		};

		var listener2 = function listener2() {
			el.removeEventListener('scrollend', listener);
		};

		el.addEventListener('scroll', listener2);
		el.addEventListener('scrollend', listener);
		el.addEventListener('scroll', listener2);
		el.addEventListener('scrollend', listener);
		el.removeEventListener('scroll', listener2);
		el.scrollTop = 10000;
	});
});
