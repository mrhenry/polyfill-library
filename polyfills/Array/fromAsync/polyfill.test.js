/* global Promise, Symbol */

it("is a function", function () {
	proclaim.isFunction(Array.fromAsync);
});

it("has correct arity", function () {
	proclaim.arity(Array.fromAsync, 1);
});

it("has correct name", function () {
	proclaim.hasName(Array.fromAsync, "fromAsync");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Array, "fromAsync");
});

// An async iterable over the given values, which logs its calls:
function createAsyncIterable(values, log) {
	var iterable = {};
	iterable[Symbol.asyncIterator] = function () {
		var i = 0;
		return {
			next: function () {
				log.push("next " + i);
				var result = i < values.length
					? { value: values[i], done: false }
					: { value: undefined, done: true };
				i++;
				return Promise.resolve(result);
			},
			"return": function () {
				log.push("return");
				return Promise.resolve({ done: true });
			}
		};
	};
	return iterable;
}

// A sync iterable over the given values, which logs its calls:
function createSyncIterable(values, log) {
	var iterable = {};
	iterable[Symbol.iterator] = function () {
		var i = 0;
		return {
			next: function () {
				log.push("next " + i);
				var result = i < values.length
					? { value: values[i], done: false }
					: { value: undefined, done: true };
				i++;
				return result;
			},
			"return": function () {
				log.push("return");
				return {};
			}
		};
	};
	return iterable;
}

function expectRejection(promise, ErrorType) {
	return promise.then(function () {
		throw new Error("Expected a rejection");
	}, function (error) {
		proclaim.isInstanceOf(error, ErrorType);
	});
}

describe("fromAsync", function () {
	it("returns a promise, also for invalid arguments", function () {
		var promise = Array.fromAsync(null);
		proclaim.isInstanceOf(promise, Promise);
		return expectRejection(promise, TypeError);
	});

	it("collects the values of an async iterable", function () {
		return Array.fromAsync(createAsyncIterable([1, 2, 3], [])).then(function (array) {
			proclaim.isTrue(Array.isArray(array));
			proclaim.deepStrictEqual(array, [1, 2, 3]);
		});
	});

	it("does not await the values of an async iterable", function () {
		var value = Promise.resolve(1);
		return Array.fromAsync(createAsyncIterable([value], [])).then(function (array) {
			proclaim.strictEqual(array[0], value);
		});
	});

	it("collects and awaits the values of a sync iterable", function () {
		return Array.fromAsync(createSyncIterable([1, Promise.resolve(2), 3], [])).then(function (array) {
			proclaim.deepStrictEqual(array, [1, 2, 3]);
		});
	});

	it("collects and awaits the values of an array-like", function () {
		return Array.fromAsync({ length: 3, 0: 1, 1: Promise.resolve(2), 2: 3 }).then(function (array) {
			proclaim.deepStrictEqual(array, [1, 2, 3]);
		});
	});

	it("prefers an async iterator over a sync one", function () {
		var iterable = createAsyncIterable(["async"], []);
		iterable[Symbol.iterator] = function () {
			throw new Error("Should not be called");
		};
		return Array.fromAsync(iterable).then(function (array) {
			proclaim.deepStrictEqual(array, ["async"]);
		});
	});

	it("requests each value only once the previous one has settled", function () {
		var log = [];
		return Array.fromAsync(createAsyncIterable([1, 2], log), function (value) {
			log.push("map " + value);
			return new Promise(function (resolve) {
				setTimeout(function () {
					log.push("mapped " + value);
					resolve(value);
				}, 10);
			});
		}).then(function () {
			proclaim.deepStrictEqual(log, ["next 0", "map 1", "mapped 1", "next 1", "map 2", "mapped 2", "next 2"]);
		});
	});

	it("calls the mapper with the value, the index and thisArg, and awaits its result", function () {
		var calls = [];
		var thisArg = {};
		return Array.fromAsync(createAsyncIterable(["a", "b"], []), function (value, index) {
			calls.push([this, value, index]);
			return Promise.resolve(value + index);
		}, thisArg).then(function (array) {
			proclaim.deepStrictEqual(array, ["a0", "b1"]);
			proclaim.strictEqual(calls.length, 2);
			proclaim.strictEqual(calls[0][0], thisArg);
			proclaim.deepStrictEqual(calls[0].slice(1), ["a", 0]);
			proclaim.deepStrictEqual(calls[1].slice(1), ["b", 1]);
		});
	});

	it("rejects for a mapper that is not callable, without iterating", function () {
		var log = [];
		return expectRejection(Array.fromAsync(createAsyncIterable([1], log), {}), TypeError).then(function () {
			proclaim.deepStrictEqual(log, []);
		});
	});

	it("closes the iterator when the mapper throws", function () {
		var log = [];
		var promise = Array.fromAsync(createAsyncIterable([1, 2], log), function () {
			throw new RangeError("mapper");
		});
		return expectRejection(promise, RangeError).then(function () {
			proclaim.deepStrictEqual(log, ["next 0", "return"]);
		});
	});

	it("closes the iterator when the mapper's promise rejects", function () {
		var log = [];
		var promise = Array.fromAsync(createAsyncIterable([1, 2], log), function () {
			return Promise.reject(new RangeError("mapper"));
		});
		return expectRejection(promise, RangeError).then(function () {
			proclaim.deepStrictEqual(log, ["next 0", "return"]);
		});
	});

	it("closes a sync iterator when one of its values rejects", function () {
		var log = [];
		var promise = Array.fromAsync(createSyncIterable([1, Promise.reject(new RangeError("value")), 3], log));
		return expectRejection(promise, RangeError).then(function () {
			// Chrome's native implementation calls `return` twice, so only check that it closes, as test262 does:
			proclaim.deepStrictEqual(log.slice(0, 3), ["next 0", "next 1", "return"]);
			proclaim.doesNotInclude(log, "next 2");
		});
	});

	it("rejects when an iterator result is not an object", function () {
		var iterable = {};
		iterable[Symbol.asyncIterator] = function () {
			return {
				next: function () {
					return Promise.resolve(1);
				}
			};
		};
		return expectRejection(Array.fromAsync(iterable), TypeError);
	});

	it("constructs a `this` that is a constructor", function () {
		var args = [];
		function C() {
			args.push(Array.prototype.slice.call(arguments));
		}
		return Array.fromAsync.call(C, createAsyncIterable([1, 2], [])).then(function (result) {
			proclaim.isInstanceOf(result, C);
			proclaim.deepStrictEqual(args, [[]]);
			proclaim.strictEqual(result[0], 1);
			proclaim.strictEqual(result[1], 2);
			proclaim.strictEqual(result.length, 2);
		});
	});

	it("constructs a `this` that is a constructor with the length of an array-like", function () {
		var args = [];
		function C() {
			args.push(Array.prototype.slice.call(arguments));
		}
		return Array.fromAsync.call(C, { length: 2, 0: "a", 1: "b" }).then(function (result) {
			proclaim.isInstanceOf(result, C);
			proclaim.deepStrictEqual(args, [[2]]);
			proclaim.strictEqual(result.length, 2);
		});
	});

	it("creates an array for a `this` that is not a constructor", function () {
		return Array.fromAsync.call({}, createAsyncIterable([1], [])).then(function (result) {
			proclaim.isTrue(Array.isArray(result));
			proclaim.deepStrictEqual(result, [1]);
		});
	});
});
