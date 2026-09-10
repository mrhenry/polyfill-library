/* global Iterator, Symbol */

it("is a function", function () {
	proclaim.isFunction(Iterator.zip);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.zip, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.zip, "zip");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator, "zip");
});

describe("zip", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			if (arr[i + 1] === "error") throw new Error("uh oh");
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
		this[Symbol.iterator] = function () {
			return new TestIterator(arr);
		};
	}

	it("should zip multiple iterables that have the same length", function () {
		var iter = Iterator.zip(new TestIterator([new TestIterator([1, 2]), new TestIterator([3, 4]), new TestIterator([5, 6])]));
		proclaim.deepStrictEqual(iter.next().value, [1, 3, 5]);
		proclaim.deepStrictEqual(iter.next().value, [2, 4, 6]);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should zip multiple iterables that have different lengths (undefined mode)", function () {
		var iter = Iterator.zip(new TestIterator([new TestIterator([1, 2]), new TestIterator([3, 4, 5]), new TestIterator([6, 7])]));
		proclaim.deepStrictEqual(iter.next().value, [1, 3, 6]);
		proclaim.deepStrictEqual(iter.next().value, [2, 4, 7]);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should zip multiple iterables that have different lengths (shortest mode)", function () {
		var iter = Iterator.zip(new TestIterator([new TestIterator([1, 2]), new TestIterator([3, 4, 5]), new TestIterator([6, 7])]), { mode: "shortest" });
		proclaim.deepStrictEqual(iter.next().value, [1, 3, 6]);
		proclaim.deepStrictEqual(iter.next().value, [2, 4, 7]);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should zip multiple iterables that have different lengths (longest mode, no padding)", function () {
		var iter = Iterator.zip(new TestIterator([new TestIterator([1, 2]), new TestIterator([3, 4, 5]), new TestIterator([6, 7])]), { mode: "longest" });
		proclaim.deepStrictEqual(iter.next().value, [1, 3, 6]);
		proclaim.deepStrictEqual(iter.next().value, [2, 4, 7]);
		proclaim.deepStrictEqual(iter.next().value, [undefined, 5, undefined]);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should zip multiple iterables that have different lengths (longest mode, with padding)", function () {
		var iter = Iterator.zip(new TestIterator([new TestIterator([1, 2]), new TestIterator([3, 4, 5, 6, 7]), new TestIterator([8, 9, 10])]), { mode: "longest", padding: new TestIterator(["a", "b"]) });
		proclaim.deepStrictEqual(iter.next().value, [1, 3, 8]);
		proclaim.deepStrictEqual(iter.next().value, [2, 4, 9]);
		proclaim.deepStrictEqual(iter.next().value, ["a", 5, 10]);
		proclaim.deepStrictEqual(iter.next().value, ["a", 6, undefined]);
		proclaim.deepStrictEqual(iter.next().value, ["a", 7, undefined]);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should zip multiple iterables that have the same length (strict mode)", function () {
		var iter = Iterator.zip(new TestIterator([new TestIterator([1, 2]), new TestIterator([3, 4]), new TestIterator([5, 6])]), { mode: "strict" });
		proclaim.deepStrictEqual(iter.next().value, [1, 3, 5]);
		proclaim.deepStrictEqual(iter.next().value, [2, 4, 6]);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should fail to zip multiple iterables that have different lengths (strict mode)", function () {
		var iter = Iterator.zip(new TestIterator([new TestIterator([1, 2]), new TestIterator([3, 4, 5]), new TestIterator([6, 7])]), { mode: "strict" });
		proclaim.deepStrictEqual(iter.next().value, [1, 3, 6]);
		proclaim.deepStrictEqual(iter.next().value, [2, 4, 7]);
		proclaim.throws(function () {
			iter.next();
		}, TypeError);
	});

	it("should zip zero iterables", function () {
		var iter = Iterator.zip(new TestIterator([]));
		proclaim.equal(iter.next().value, undefined);
	});

	it("should implement `return`", function () {
		var iter = Iterator.zip(new TestIterator([new TestIterator([1, 2, 3]), new TestIterator([4, 5]), new TestIterator([6, 7])]));
		proclaim.deepStrictEqual(iter.next().value, [1, 4, 6]);
		proclaim.equal(iter.return().value, undefined);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should handle errors during iteration", function () {
		var iter = Iterator.zip(new TestIterator([new TestIterator([1, 2, 3]), new TestIterator([4, "error"]), new TestIterator([5, 6])]));
		proclaim.deepStrictEqual(iter.next().value, [1, 4, 5]);
		proclaim.throws(function () {
			iter.next();
		}, /uh oh/);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should handle errors during iterables iteration", function () {
		proclaim.throws(function () {
			Iterator.zip(new TestIterator([new TestIterator([1]), "error"]));
		}, /uh oh/);
	});

	it("should handle errors during padding iteration", function () {
		proclaim.throws(function () {
			Iterator.zip(new TestIterator([new TestIterator([1]), new TestIterator([2])]), { mode: "longest", padding: new TestIterator(["a", "error"]) });
		}, /uh oh/);
	});

	it("should return an object with the right prototype", function () {
		var iter = Iterator.zip(new TestIterator([]));
		// use `Iterator.prototype.take` as a way to get `IteratorHelperPrototype`
		proclaim.isFunction(iter.take);
		proclaim.equal(Object.getPrototypeOf(iter), Object.getPrototypeOf(iter.take(0)));
	});
});
