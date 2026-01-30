/* global WeakMap */

it("is a function", function () {
	proclaim.isFunction(WeakMap.prototype.getOrInsertComputed);
});

it("has correct arity", function () {
	proclaim.arity(WeakMap.prototype.getOrInsertComputed, 2);
});

it("has correct name", function () {
	proclaim.hasName(WeakMap.prototype.getOrInsertComputed, "getOrInsertComputed");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(WeakMap.prototype, "getOrInsertComputed");
});

describe("getOrInsertComputed", function () {
	it("gets a value for a key that already exists", function () {
		var key = {};
		var map = new WeakMap([[key, 1]]);
		var callback = function () {
			throw new Error("should not have been called");
		};
		proclaim.equal(map.getOrInsertComputed(key, callback), 1);
		proclaim.equal(map.get(key), 1);
	});

	it("inserts a value for a key that doesn't already exist", function () {
		var key = { k: 2 };
		var map = new WeakMap([[{}, 1]]);
		var callback = function (key) {
			return key.k;
		};
		proclaim.equal(map.getOrInsertComputed(key, callback), 2);
		proclaim.equal(map.get(key), 2);
	});

	it("throws for an invalid `this`", function () {
		proclaim.throws(function () {
			WeakMap.prototype.getOrInsertComputed.call({}, {}, 1);
		}, TypeError);
	});

	it("throws for an invalid `key`", function () {
		proclaim.throws(function () {
			WeakMap.prototype.getOrInsertComputed.call(new WeakMap(), "a", 1);
		}, TypeError);
	});

	it("throws for an invalid `callback`", function () {
		proclaim.throws(function () {
			WeakMap.prototype.getOrInsertComputed.call(new WeakMap(), {}, {});
		}, TypeError);
	});
});
