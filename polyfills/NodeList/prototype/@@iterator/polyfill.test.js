/* global Iterator, Symbol */

function getNodeList() {
	var fragment = document.createDocumentFragment();
	fragment.appendChild(document.createElement('div'));
	fragment.appendChild(document.createElement('div'));
	return fragment.childNodes;
}

it('exists', function () {
	if (!Symbol || !Symbol.iterator) {
		proclaim.fail();
		return;
	}
	proclaim.isInstanceOf(getNodeList()[Symbol.iterator], Function);
});

it('returns a next-able object', function () {
	var nodeList = getNodeList();
	var iterator = nodeList[Symbol.iterator]();

	proclaim.isInstanceOf(iterator.next, Function);
	proclaim.deepEqual(iterator.next(), {
		value: nodeList[0],
		done: false
	});
});

it('returns an `Iterator`', function () {
	var iterator = getNodeList()[Symbol.iterator]();
	proclaim.isInstanceOf(iterator, Iterator);
});

it('finally returns a done object', function () {
	var nodeList = getNodeList();
	var iterator = nodeList[Symbol.iterator]();
	iterator.next();
	iterator.next();
	proclaim.equal(iterator.next().done, true);
});

it("returns an iterable", function () {
	proclaim.isDefined(getNodeList()[Symbol.iterator]()[Symbol.iterator]);
});
