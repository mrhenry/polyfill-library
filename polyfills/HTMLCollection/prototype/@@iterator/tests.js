/* eslint-env mocha, browser */
/* global proclaim, Symbol */

var collectionId = 0;
function getHTMLCollection() {
	collectionId++;
	document.body.appendChild(document.createElement('something' + collectionId));
	document.body.appendChild(document.createElement('something' + collectionId));
	return document.getElementsByTagName('something' + collectionId);
}

it('exists', function () {
	if (!Symbol || !Symbol.iterator) {
		proclaim.fail();
		return;
	}
	proclaim.isInstanceOf(getHTMLCollection()[Symbol.iterator], Function);
});

it('returns a next-able object', function () {
	var htmlCollection = getHTMLCollection();
	var iterator = htmlCollection[Symbol.iterator]();

	proclaim.isInstanceOf(iterator.next, Function);
	proclaim.deepEqual(iterator.next(), {
		value: htmlCollection[0],
		done: false
	});
});

it('finally returns a done object', function () {
	var htmlCollection = getHTMLCollection();
	var iterator = htmlCollection[Symbol.iterator]();
	iterator.next();
	iterator.next();
	proclaim.equal(iterator.next().done, true);
});
