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
	it("gets a value for a key that already exists", function () {
		var map = new Map([["a", 1]]);
		proclaim.equal(map.getOrInsert("a", 2), 1);
		proclaim.equal(map.get("a"), 1);
	});

	it("inserts a value for a key that doesn't already exist", function () {
		var map = new Map([["a", 1]]);
		proclaim.equal(map.getOrInsert("b", 2), 2);
		proclaim.equal(map.get("b"), 2);
	});

	it("throws for an invalid `this`", function () {
		proclaim.throws(function () {
			Map.prototype.getOrInsert.call({}, "a", 1);
		}, TypeError);
	});
});
