/* global WeakMap */

it("is a function", function () {
	proclaim.isFunction(WeakMap.prototype.getOrInsert);
});

it("has correct arity", function () {
	proclaim.arity(WeakMap.prototype.getOrInsert, 2);
});

it("has correct name", function () {
	proclaim.hasName(WeakMap.prototype.getOrInsert, "getOrInsert");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(WeakMap.prototype, "getOrInsert");
});

describe("getOrInsert", function () {
	it("gets a value for a key that already exists", function () {
		var key = {};
		var map = new WeakMap([[key, 1]]);
		proclaim.equal(map.getOrInsert(key, 2), 1);
		proclaim.equal(map.get(key), 1);
	});

	it("inserts a value for a key that doesn't already exist", function () {
		var key = {};
		var map = new WeakMap([[{}, 1]]);
		proclaim.equal(map.getOrInsert(key, 2), 2);
		proclaim.equal(map.get(key), 2);
	});

	it("throws for an invalid `this`", function () {
		proclaim.throws(function () {
			WeakMap.prototype.getOrInsert.call({}, {}, 1);
		}, TypeError);
	});

	it("throws for an invalid `key`", function () {
		proclaim.throws(function () {
			WeakMap.prototype.getOrInsert.call(new WeakMap(), "a", 1);
		}, TypeError);
	});
});
