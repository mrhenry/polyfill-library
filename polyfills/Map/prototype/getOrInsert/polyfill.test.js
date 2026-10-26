/* global Map */

it("is a function", function () {
	proclaim.isFunction(Map.prototype.getOrInsert);
});

it("has correct arity", function () {
	proclaim.arity(Map.prototype.getOrInsert, 2);
});

it("has correct name", function () {
	proclaim.hasName(Map.prototype.getOrInsert, "getOrInsert");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Map.prototype, "getOrInsert");
});

describe("getOrInsert", function () {
	it("returns the existing value and leaves the map unchanged", function () {
		var map = new Map([["a", 1]]);
		proclaim.strictEqual(map.getOrInsert("a", 2), 1);
		proclaim.strictEqual(map.get("a"), 1);
		proclaim.strictEqual(map.size, 1);
	});

	it("inserts and returns the value for a new key", function () {
		var map = new Map([["a", 1]]);
		proclaim.strictEqual(map.getOrInsert("b", 2), 2);
		proclaim.strictEqual(map.get("b"), 2);
		proclaim.strictEqual(map.size, 2);
	});

	it("finds a key stored with an undefined value", function () {
		var map = new Map([["a", undefined]]);
		proclaim.strictEqual(map.getOrInsert("a", 1), undefined);
		proclaim.strictEqual(map.size, 1);
	});

	it("canonicalizes -0 to +0", function () {
		var map = new Map();
		map.getOrInsert(-0, "zero");
		var key = map.keys().next().value;
		proclaim.strictEqual(1 / key, Infinity);
		proclaim.strictEqual(map.getOrInsert(0, "other"), "zero");
	});

	it("throws for an invalid `this`", function () {
		proclaim.throws(function () {
			Map.prototype.getOrInsert.call({}, "a", 1);
		}, TypeError);
	});
});
