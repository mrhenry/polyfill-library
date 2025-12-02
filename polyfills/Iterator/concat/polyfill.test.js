/* global Iterator, Symbol */

it("is a function", function () {
	proclaim.isFunction(Iterator.concat);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.concat, 0);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.concat, "concat");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator, "concat");
});

describe("concat", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
		this[Symbol.iterator] = function () {
			return new TestIterator(arr);
		};
	}

	it("should concatenate multiple iterables", function () {
		var iter = Iterator.concat(new TestIterator([1, 2, 3]), new TestIterator([4, 5]), new TestIterator([6, 7]));
		proclaim.equal(iter.next().value, 1);
		proclaim.equal(iter.next().value, 2);
		proclaim.equal(iter.next().value, 3);
		proclaim.equal(iter.next().value, 4);
		proclaim.equal(iter.next().value, 5);
		proclaim.equal(iter.next().value, 6);
		proclaim.equal(iter.next().value, 7);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should concatenate zero iterables", function () {
		var iter = Iterator.concat();
		proclaim.equal(iter.next().value, undefined);
	});

	it("should implement `return`", function () {
		var iter = Iterator.concat(new TestIterator([1, 2, 3]), new TestIterator([4, 5]), new TestIterator([6, 7]));
		proclaim.equal(iter.next().value, 1);
		proclaim.equal(iter.return().value, undefined);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should handle errors during iteration", function () {
		var iter = Iterator.concat(new TestIterator([1, 2, 3]), new TestIterator(), new TestIterator([6, 7]));
		proclaim.equal(iter.next().value, 1);
		proclaim.equal(iter.next().value, 2);
		proclaim.equal(iter.next().value, 3);
		proclaim.throws(function () {
			iter.next();
		}, TypeError);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should return an object with the right prototype", function () {
		var iter = Iterator.concat();
		proclaim.equal(iter.toString(), "[object Iterator Helper]");
	});
});
