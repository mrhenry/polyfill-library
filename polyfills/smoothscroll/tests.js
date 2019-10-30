/* eslint-env mocha, browser */
/* global proclaim */

describe('scroll', function () {
    it('is defined as a function on window', function () {
        proclaim.isTypeOf(window.scroll, 'function');
    });

    it('is defined as a function on Element.prototype', function () {
        proclaim.isTypeOf(Element.prototype.scroll, 'function');
    });
});

describe('scrollBy', function () {
    it('is defined as a function on window', function () {
        proclaim.isTypeOf(window.scrollBy, 'function');
    });

    it('is defined as a function on Element.prototype', function () {
        proclaim.isTypeOf(Element.prototype.scrollBy, 'function');
    });
});

describe('scrollIntoView', function () {
    it('is defined as a function on Element.prototype', function () {
        proclaim.isTypeOf(Element.prototype. scrollIntoView, 'function');
    });
});
