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
