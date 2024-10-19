/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.forEach);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.forEach, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.forEach, "forEach");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "forEach");
});

describe("forEach", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should execute a function for every element in an iterator", function () {
		var result = [];
		new TestIterator([1, 2, 3]).forEach(function (v, i) {
			result.push(v + i);
		});
		proclaim.deepEqual(result, [1, 3, 5]);
	});
});
