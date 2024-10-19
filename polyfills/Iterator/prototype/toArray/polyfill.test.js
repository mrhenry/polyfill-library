/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.toArray);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.toArray, 0);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.toArray, "toArray");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "toArray");
});

describe("toArray", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should make an array from an iterator", function () {
		var result = new TestIterator([1, 2, 3]).toArray();
		proclaim.deepEqual(result, [1, 2, 3]);
	});
});
