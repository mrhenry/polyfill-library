/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Math.sumPrecise);
});

it("has correct arity", function () {
	proclaim.arity(Math.sumPrecise, 1);
});

it("has correct name", function () {
	proclaim.hasName(Math.sumPrecise, "sumPrecise");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Math, "sumPrecise");
});

describe("sumPrecise", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should compute a precise sum", function () {
		proclaim.equal(Math.sumPrecise(new TestIterator([1e20, 0.1, -1e20])), 0.1);
		proclaim.equal(Math.sumPrecise(new TestIterator([0.1, 0.2])), 0.30000000000000004);
		proclaim.isNaN(Math.sumPrecise(new TestIterator([NaN, 1])));
		proclaim.equal(Math.sumPrecise(new TestIterator([Infinity, 1])), Infinity);
		proclaim.equal(Math.sumPrecise(new TestIterator([-Infinity, 1])), -Infinity);
		proclaim.isNaN(Math.sumPrecise(new TestIterator([-Infinity, Infinity])));

		proclaim.throws(function () {
			Math.sumPrecise(new TestIterator(["x"]));
		}, TypeError);
	});
});
