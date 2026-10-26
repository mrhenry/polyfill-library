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
	it("returns the existing value without calling the callback", function () {
		var map = new Map([["a", 1]]);
		var calls = 0;
		proclaim.strictEqual(map.getOrInsertComputed("a", function () {
			calls++;
			return 2;
		}), 1);
		proclaim.strictEqual(calls, 0);
		proclaim.strictEqual(map.get("a"), 1);
	});

	it("inserts and returns the computed value for a new key", function () {
		var map = new Map();
		proclaim.strictEqual(map.getOrInsertComputed("a", function () {
			return 1;
		}), 1);
		proclaim.strictEqual(map.get("a"), 1);
		proclaim.strictEqual(map.size, 1);
	});

	it("calls the callback once, with the key and an undefined `this`", function () {
		var map = new Map();
		var calls = [];
		map.getOrInsertComputed("a", function () {
			"use strict";
			calls.push({ self: this, args: Array.prototype.slice.call(arguments) });
		});
		proclaim.strictEqual(calls.length, 1);
		proclaim.strictEqual(calls[0].self, undefined);
		proclaim.deepEqual(calls[0].args, ["a"]);
	});

	it("passes -0 to the callback as +0, and stores it as +0", function () {
		var map = new Map();
		var received;
		map.getOrInsertComputed(-0, function (key) {
			received = key;
			return "zero";
		});
		proclaim.strictEqual(1 / received, Infinity);
		proclaim.strictEqual(1 / map.keys().next().value, Infinity);
	});

	it("overwrites a value that the callback inserted, in place", function () {
		var map = new Map([["first", 0]]);
		var value = map.getOrInsertComputed("a", function () {
			map.set("a", "inner");
			map.set("last", 0);
			return "outer";
		});
		proclaim.strictEqual(value, "outer");
		proclaim.strictEqual(map.get("a"), "outer");
		var keys = [];
		map.forEach(function (value, key) {
			keys.push(key);
		});
		proclaim.deepEqual(keys, ["first", "a", "last"]);
	});

	it("does not insert when the callback throws", function () {
		var map = new Map();
		proclaim.throws(function () {
			map.getOrInsertComputed("a", function () {
				throw new Error("callback");
			});
		}, Error);
		proclaim.isFalse(map.has("a"));
	});

	it("throws for a callback that is not callable, even for an existing key", function () {
		var map = new Map([["a", 1]]);
		proclaim.throws(function () {
			map.getOrInsertComputed("a", null);
		}, TypeError);
	});

	it("throws for an invalid `this`", function () {
		proclaim.throws(function () {
			Map.prototype.getOrInsertComputed.call({}, "a", function () {});
		}, TypeError);
	});
});
