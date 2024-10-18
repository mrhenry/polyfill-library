/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.filter);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.filter, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.filter, "filter");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "filter");
});

describe("filter", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should filter an iterator", function () {
		var iter = new TestIterator([1, 2, 3]).filter(function (v, i) {
			return v === 1 || i == 2;
		});
		proclaim.equal(iter.next().value, 1);
		proclaim.equal(iter.next().value, 3);
		proclaim.equal(iter.next().value, undefined);
	});
});
