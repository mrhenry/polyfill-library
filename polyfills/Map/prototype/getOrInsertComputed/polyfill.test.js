/* global Map */

it("is a function", function () {
	proclaim.isFunction(Map.prototype.getOrInsertComputed);
});

it("has correct arity", function () {
	proclaim.arity(Map.prototype.getOrInsertComputed, 2);
});

it("has correct name", function () {
	proclaim.hasName(Map.prototype.getOrInsertComputed, "getOrInsertComputed");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Map.prototype, "getOrInsertComputed");
});

describe("getOrInsertComputed", function () {
	it("gets a value for a key that already exists", function () {
		var map = new Map([["a", 1]]);
		var callback = function () {
			throw new Error("should not have been called");
		};
		proclaim.equal(map.getOrInsertComputed("a", callback), 1);
		proclaim.equal(map.get("a"), 1);
	});

	it("inserts a value for a key that doesn't already exist", function () {
		var map = new Map([["a", 1]]);
		var callback = function (key) {
			return key + key;
		};
		proclaim.equal(map.getOrInsertComputed("b", callback), "bb");
		proclaim.equal(map.get("b"), "bb");
	});

	it("throws for an invalid `this`", function () {
		proclaim.throws(function () {
			Map.prototype.getOrInsertComputed.call({}, "a", 1);
		}, TypeError);
	});

	it("throws for an invalid `callback`", function () {
		proclaim.throws(function () {
			Map.prototype.getOrInsertComputed.call(new Map(), "a", {});
		}, TypeError);
	});
});
