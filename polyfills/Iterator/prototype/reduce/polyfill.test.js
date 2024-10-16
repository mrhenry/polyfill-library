/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.reduce);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.reduce, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.reduce, "reduce");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "reduce");
});

describe("reduce", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should reduce an iterator", function () {
		var result;
		result = new TestIterator([1, 2, 3]).reduce(function (s, v, i) {
			return s + v + i;
		});
		proclaim.equal(result, 9);
		result = new TestIterator([1, 2, 3]).reduce(function (s, v, i) {
			return s + v + i;
		}, 1);
		proclaim.equal(result, 10);
	});
});
