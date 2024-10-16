/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.find);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.find, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.find, "find");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "find");
});

describe("find", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should find an element in an iterator", function () {
		var result;
		result = new TestIterator([1, 2, 3]).find(function (v, i) {
			return v + i > 2;
		});
		proclaim.equal(result, 2);
		result = new TestIterator([1, 2, 3]).find(function (v, i) {
			return v + i > 5;
		});
		proclaim.isUndefined(result);
	});
});
