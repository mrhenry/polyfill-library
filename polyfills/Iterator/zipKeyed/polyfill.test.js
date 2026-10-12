/* global Iterator, Reflect, Symbol */

it("is a function", function () {
	proclaim.isFunction(Iterator.zipKeyed);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.zipKeyed, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.zipKeyed, "zipKeyed");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator, "zipKeyed");
});

describe("zipKeyed", function () {
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

	// we can't use `proclaim.deepEqual` directly because results have null prototype
	function deepEqual(actual, expected) {
		var actualKeys = Reflect.ownKeys(actual);
		var expectedKeys = Reflect.ownKeys(expected);
		proclaim.deepStrictEqual(actualKeys, expectedKeys);
		for (var i = 0; i < actualKeys.length; i++) {
			proclaim.deepStrictEqual(actual[actualKeys[i]], expected[actualKeys[i]]);
		}
	}

	it("should zip multiple iterables that have the same length", function () {
		var iter = Iterator.zipKeyed({ a: new TestIterator([1, 2]), b: new TestIterator([3, 4]), c: new TestIterator([5, 6]) });
		deepEqual(iter.next().value, { a: 1, b: 3, c: 5 });
		deepEqual(iter.next().value, { a: 2, b: 4, c: 6 });
		proclaim.equal(iter.next().value, undefined);
	});

	it("should zip multiple iterables that have different lengths (undefined mode)", function () {
		var iter = Iterator.zipKeyed({ a: new TestIterator([1, 2]), b: new TestIterator([3, 4, 5]), c: new TestIterator([6, 7]) });
		deepEqual(iter.next().value, { a: 1, b: 3, c: 6 });
		deepEqual(iter.next().value, { a: 2, b: 4, c: 7 });
		proclaim.equal(iter.next().value, undefined);
	});

	it("should zip multiple iterables that have different lengths (shortest mode)", function () {
		var iter = Iterator.zipKeyed({ a: new TestIterator([1, 2]), b: new TestIterator([3, 4, 5]), c: new TestIterator([6, 7]) }, { mode: "shortest" });
		deepEqual(iter.next().value, { a: 1, b: 3, c: 6 });
		deepEqual(iter.next().value, { a: 2, b: 4, c: 7 });
		proclaim.equal(iter.next().value, undefined);
	});

	it("should zip multiple iterables that have different lengths (longest mode, no padding)", function () {
		var iter = Iterator.zipKeyed({ a: new TestIterator([1, 2]), b: new TestIterator([3, 4, 5]), c: new TestIterator([6, 7]) }, { mode: "longest" });
		deepEqual(iter.next().value, { a: 1, b: 3, c: 6 });
		deepEqual(iter.next().value, { a: 2, b: 4, c: 7 });
		deepEqual(iter.next().value, { a: undefined, b: 5, c: undefined });
		proclaim.equal(iter.next().value, undefined);
	});

	it("should zip multiple iterables that have different lengths (longest mode, with padding)", function () {
		var iter = Iterator.zipKeyed({ a: new TestIterator([1, 2]), b: new TestIterator([3, 4, 5, 6, 7]), c: new TestIterator([8, 9, 10]) }, { mode: "longest", padding: { a: "a", b: "b" } });
		deepEqual(iter.next().value, { a: 1, b: 3, c: 8 });
		deepEqual(iter.next().value, { a: 2, b: 4, c: 9 });
		deepEqual(iter.next().value, { a: "a", b: 5, c: 10 });
		deepEqual(iter.next().value, { a: "a", b: 6, c: undefined });
		deepEqual(iter.next().value, { a: "a", b: 7, c: undefined });
		proclaim.equal(iter.next().value, undefined);
	});

	it("should zip multiple iterables that have the same length (strict mode)", function () {
		var iter = Iterator.zipKeyed({ a: new TestIterator([1, 2]), b: new TestIterator([3, 4]), c: new TestIterator([5, 6]) }, { mode: "strict" });
		deepEqual(iter.next().value, { a: 1, b: 3, c: 5 });
		deepEqual(iter.next().value, { a: 2, b: 4, c: 6 });
		proclaim.equal(iter.next().value, undefined);
	});

	it("should fail to zip multiple iterables that have different lengths (strict mode)", function () {
		var iter = Iterator.zipKeyed({ a: new TestIterator([1, 2]), b: new TestIterator([3, 4, 5]), c: new TestIterator([6, 7]) }, { mode: "strict" });
		deepEqual(iter.next().value, { a: 1, b: 3, c: 6 });
		deepEqual(iter.next().value, { a: 2, b: 4, c: 7 });
		proclaim.throws(function () {
			iter.next();
		}, TypeError);
	});

	it("should zip zero iterables", function () {
		var iter = Iterator.zipKeyed({});
		proclaim.equal(iter.next().value, undefined);
	});

	it("should implement `return`", function () {
		var iter = Iterator.zipKeyed({ a: new TestIterator([1, 2, 3]), b: new TestIterator([4, 5]), c: new TestIterator([6, 7]) });
		deepEqual(iter.next().value, { a: 1, b: 4, c: 6 });
		proclaim.equal(iter.return().value, undefined);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should handle errors during iteration", function () {
		var iter = Iterator.zipKeyed({ a: new TestIterator([1, 2, 3]), b: new TestIterator([4, "error"]), c: new TestIterator([5, 6]) });
		deepEqual(iter.next().value, { a: 1, b: 4, c: 5 });
		proclaim.throws(function () {
			iter.next();
		}, /uh oh/);
		proclaim.equal(iter.next().value, undefined);
	});

	it("should emit objects with null prototype", function () {
		var iter = Iterator.zipKeyed({ a: new TestIterator([1]) });
		proclaim.equal(
			Object.getPrototypeOf(iter.next().value),
			null
		);
	});

	it("should return an object with the right prototype", function () {
		var iter = Iterator.zipKeyed(new TestIterator([]));
		// use `Iterator.prototype.take` as a way to get `IteratorHelperPrototype`
		proclaim.isFunction(iter.take);
		proclaim.equal(Object.getPrototypeOf(iter), Object.getPrototypeOf(iter.take(0)));
	});
});
