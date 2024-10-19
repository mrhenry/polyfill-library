/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.take);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.take, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.take, "take");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "take");
});

describe("take", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should keep the given number of elements at the start of an iterator", function () {
		var iter = new TestIterator([1, 2, 3]).take(2);
		proclaim.equal(iter.next().value, 1);
		proclaim.equal(iter.next().value, 2);
		proclaim.equal(iter.next().value, undefined);
	});
});
