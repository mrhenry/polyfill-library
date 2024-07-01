describe('scroll', function () {
	it('is defined as a function on window', function () {
		proclaim.isTypeOf(window.scroll, 'function');
	});

	it('is defined as a function on Element.prototype', function () {
		// The polyfill only patches HTMLElement if available.
		var Element = window.HTMLElement || window.Element;
		proclaim.isTypeOf(Element.prototype.scroll, 'function');
	});
});

describe('scrollBy', function () {
	it('is defined as a function on window', function () {
		proclaim.isTypeOf(window.scrollBy, 'function');
	});

	it('is defined as a function on Element.prototype', function () {
		var Element = window.HTMLElement || window.Element;
		proclaim.isTypeOf(Element.prototype.scrollBy, 'function');
	});
});

describe('scrollTo', function () {
	it('is defined as a function on window', function () {
		proclaim.isTypeOf(window.scrollTo, 'function');
	});

	it('is defined as a function on Element.prototype', function () {
		var Element = window.HTMLElement || window.Element;
		proclaim.isTypeOf(Element.prototype.scrollTo, 'function');
	});
});

describe('scrollIntoView', function () {
	it('is defined as a function on Element.prototype', function () {
		var Element = window.HTMLElement || window.Element;
		proclaim.isTypeOf(Element.prototype.scrollIntoView, 'function');
	});
});
