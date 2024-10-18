/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.every);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.every, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.every, "every");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "every");
});

describe("every", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should test every element of an iterator", function () {
		var result;
		result = new TestIterator([1, 2, 3]).every(function (v, i) {
			return v + i < 6;
		});
		proclaim.isTrue(result);
		result = new TestIterator([1, 2, 3]).every(function (v, i) {
			return v + i < 5;
		});
		proclaim.isFalse(result);
	});
});
