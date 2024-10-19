/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.flatMap);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.flatMap, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.flatMap, "flatMap");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "flatMap");
});

describe("flatMap", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should flat map over an iterator", function () {
		var iter = new TestIterator([1, 2, 3]).flatMap(function (v, i) {
			return [v, i];
		});
		proclaim.equal(iter.next().value, 1);
		proclaim.equal(iter.next().value, 0);
		proclaim.equal(iter.next().value, 2);
		proclaim.equal(iter.next().value, 1);
		proclaim.equal(iter.next().value, 3);
		proclaim.equal(iter.next().value, 2);
		proclaim.equal(iter.next().value, undefined);
	});
});
