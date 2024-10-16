/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.some);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.some, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.some, "some");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "some");
});

describe("some", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should test some elements of an iterator", function () {
		var result;
		result = new TestIterator([1, 2, 3]).some(function (v, i) {
			return v + i > 4;
		});
		proclaim.isTrue(result);
		result = new TestIterator([1, 2, 3]).some(function (v, i) {
			return v + i > 5;
		});
		proclaim.isFalse(result);
	});
});
