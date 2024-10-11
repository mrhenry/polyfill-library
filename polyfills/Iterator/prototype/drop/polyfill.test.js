/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.drop);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.drop, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.drop, "drop");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "drop");
});

describe("drop", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should skip the given number of elements at the start of an iterator", function () {
		var iter = new TestIterator([1, 2, 3]).drop(1);
		proclaim.equal(iter.next().value, 2);
		proclaim.equal(iter.next().value, 3);
		proclaim.equal(iter.next().value, undefined);
	});
});
