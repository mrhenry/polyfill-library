/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.chunks);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.chunks, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.chunks, "chunks");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "chunks");
});

describe("chunks", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			if (arr[i] === "error") {
				throw new Error("uh oh");
			}
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should chunk an iterator", function () {
		var iter = new TestIterator([1, 2, 3]).chunks(2);
		proclaim.deepStrictEqual(iter.next().value, [1, 2]);
		proclaim.deepStrictEqual(iter.next().value, [3]);
		proclaim.equal(iter.next().value, undefined);

		iter = new TestIterator([1, 2, 3, 4]).chunks(2);
		proclaim.deepStrictEqual(iter.next().value, [1, 2]);
		proclaim.deepStrictEqual(iter.next().value, [3, 4]);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should throw for invalid `chunkSize`", function () {
		proclaim.throws(function () {
			new TestIterator([1, 2, 3]).chunks(NaN);
		}, TypeError);
		proclaim.throws(function () {
			new TestIterator([1, 2, 3]).chunks(1.5);
		}, TypeError);
		proclaim.throws(function () {
			new TestIterator([1, 2, 3]).chunks(0);
		}, RangeError);
		proclaim.throws(function () {
			new TestIterator([1, 2, 3]).chunks(Math.pow(2, 32));
		}, RangeError);
	});

	it("should handle errors during iteration", function () {
		// TODO check this behavior
		var iter = new TestIterator([1, 2, "error", 4]).chunks(1);
		proclaim.deepStrictEqual(iter.next().value, [1]);
		proclaim.deepStrictEqual(iter.next().value, [2]);
		proclaim.throws(function () {
			iter.next();
		}, Error);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should return an object with the right prototype", function () {
		var iter = new TestIterator([]).chunks(1);
		// use `Iterator.prototype.take` as a way to get `IteratorHelperPrototype`
		proclaim.isFunction(iter.take);
		proclaim.equal(Object.getPrototypeOf(iter), Object.getPrototypeOf(iter.take(0)));
	});
});
