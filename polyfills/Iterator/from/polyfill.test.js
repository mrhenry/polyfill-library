/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.from);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.from, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.from, "from");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator, "from");
});

describe("from", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}

	it("should create an iterator from an iterator-like", function () {
		var iter = Iterator.from(new TestIterator([1, 2, 3]));
		proclaim.equal(iter.next().value, 1);
		proclaim.equal(iter.next().value, 2);
		proclaim.equal(iter.next().value, 3);
		proclaim.equal(iter.next().value, undefined);
	});
});
