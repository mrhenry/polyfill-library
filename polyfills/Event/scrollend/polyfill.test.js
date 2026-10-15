describe('Event.scrollend', function () {
	// Scrolling and scroll events can be flaky in headless mode.
	// CI environments are often headless.
	this.retries(3);
	this.timeout(10 * 1000);

	var el;

	// The polyfill dispatches scrollend 100ms after the last scroll event, and a
	// loaded CI machine can take much longer than that to deliver the scroll in
	// the first place. Wait for the expected number of calls instead of asserting
	// after a fixed delay, then give the polyfill a moment to deliver any stray
	// extra call before finishing.
	var expectCalls = function (getCount, expected, done) {
		var startedAt = Date.now();
		var deadline = startedAt + 5000;
		// A listener that should never fire needs long enough for the scrollend
		// the polyfill would otherwise dispatch to have had a chance to arrive.
		var minimum = expected === 0 ? 1500 : 0;

		(function poll() {
			var count = getCount();

			if (count > expected || Date.now() >= deadline) {
				throw new Error('Listener was called ' + count + ' times, expected ' + expected);
			}

			if (count < expected || Date.now() - startedAt < minimum) {
				setTimeout(poll, 25);
				return;
			}

			setTimeout(function () {
				var settled = getCount();

				if (settled !== expected) {
					throw new Error('Listener was called ' + settled + ' times, expected ' + expected);
				}

				done();
			}, 500);
		}());
	};

	before(function () {
		el = document.body.appendChild(document.createElement("div"));
		el.setAttribute("style", "height: 10000px; overflow: auto; width: 10px; background-color: blue;");

		var content = document.createElement("div");
		content.setAttribute("style", "height: 20000px; width: 10px; background-color: cyan;");

		el.appendChild(content);
	});

	after(function () {
		document.body.removeChild(el);
	});

	afterEach(function () {
		el.scrollTo(0, 0);
		el.scrollTop = 0;
		window.scrollTo(0, 0);
		window.scrollTop = 0;
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

	it('respects once on elements', function (done) {
		var counter = 0;
		var listener = function listener() {
			counter++;
		};

		el.addEventListener('scrollend', listener, { once: true });

		el.scrollTop = 10000;
		setTimeout(function () {
			el.scrollTop = 0;
		}, 200);

		expectCalls(function () {
			return counter;
		}, 1, done);
	});

	it('respects once on the document', function (done) {
		var counter = 0;
		var listener = function listener() {
			counter++;
		};

		document.addEventListener('scrollend', listener, { once: true });

		window.scrollTo(0, 10000);
		setTimeout(function () {
			window.scrollTo(0, 0);
		}, 200);

		expectCalls(function () {
			return counter;
		}, 1, done);
	});

	it('respects once on the window', function (done) {
		var counter = 0;
		var listener = function listener() {
			counter++;
		};

		window.addEventListener('scrollend', listener, { once: true });

		window.scrollTo(0, 10000);
		setTimeout(function () {
			window.scrollTo(0, 0);
		}, 200);

		expectCalls(function () {
			return counter;
		}, 1, done);
	});

	it('removes listeners on elements', function (done) {
		var counter = 0;
		var listener = function listener() {
			counter++;
		};

		el.addEventListener('scrollend', listener);
		el.removeEventListener('scrollend', listener);
		el.scrollTop = 10000;

		expectCalls(function () {
			return counter;
		}, 0, done);
	});

	it('removes listeners on the document', function (done) {
		var counter = 0;
		var listener = function listener() {
			counter++;
		};

		document.addEventListener('scrollend', listener);
		document.removeEventListener('scrollend', listener);
		window.scrollTo(0, 10000);

		expectCalls(function () {
			return counter;
		}, 0, done);
	});

	it('removes listeners on the window', function (done) {
		var counter = 0;
		var listener = function listener() {
			counter++;
		};

		window.addEventListener('scrollend', listener);
		window.removeEventListener('scrollend', listener);
		window.scrollTo(0, 10000);

		expectCalls(function () {
			return counter;
		}, 0, done);
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

		expectCalls(function () {
			return counter;
		}, 1, done);
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

		expectCalls(function () {
			return counter;
		}, 0, done);
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
