/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.map);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.map, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.map, "map");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "map");
});

describe("map", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should map over an iterator", function () {
		var iter = new TestIterator([1, 2, 3]).map(function (v, i) {
			return v + i;
		});
		proclaim.equal(iter.next().value, 1);
		proclaim.equal(iter.next().value, 3);
		proclaim.equal(iter.next().value, 5);
		proclaim.equal(iter.next().value, undefined);
	});
});
