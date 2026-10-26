/* global Symbol, WeakMap */

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
	it("returns the existing value without calling the callback", function () {
		var key = {};
		var weakMap = new WeakMap([[key, 1]]);
		var calls = 0;
		proclaim.strictEqual(weakMap.getOrInsertComputed(key, function () {
			calls++;
			return 2;
		}), 1);
		proclaim.strictEqual(calls, 0);
	});

	it("inserts and returns the computed value for a new key", function () {
		var key = {};
		var weakMap = new WeakMap();
		proclaim.strictEqual(weakMap.getOrInsertComputed(key, function () {
			return 1;
		}), 1);
		proclaim.strictEqual(weakMap.get(key), 1);
	});

	it("calls the callback once, with the key and an undefined `this`", function () {
		var key = {};
		var weakMap = new WeakMap();
		var calls = [];
		weakMap.getOrInsertComputed(key, function () {
			"use strict";
			calls.push({ self: this, args: Array.prototype.slice.call(arguments) });
		});
		proclaim.strictEqual(calls.length, 1);
		proclaim.strictEqual(calls[0].self, undefined);
		proclaim.strictEqual(calls[0].args.length, 1);
		proclaim.strictEqual(calls[0].args[0], key);
	});

	it("overwrites a value that the callback inserted", function () {
		var key = {};
		var weakMap = new WeakMap();
		var value = weakMap.getOrInsertComputed(key, function () {
			weakMap.set(key, "inner");
			return "outer";
		});
		proclaim.strictEqual(value, "outer");
		proclaim.strictEqual(weakMap.get(key), "outer");
	});

	it("throws for a key that can't be held weakly, without calling the callback", function () {
		var weakMap = new WeakMap();
		var calls = 0;
		proclaim.throws(function () {
			weakMap.getOrInsertComputed("a", function () {
				calls++;
			});
		}, TypeError);
		proclaim.strictEqual(calls, 0);
	});

	if ("Symbol" in self && "for" in Symbol) {
		it("throws for a registered symbol, without calling the callback", function () {
			var weakMap = new WeakMap();
			var calls = 0;
			proclaim.throws(function () {
				weakMap.getOrInsertComputed(Symbol.for("registered"), function () {
					calls++;
				});
			}, TypeError);
			proclaim.strictEqual(calls, 0);
		});
	}

	it("throws for a callback that is not callable, even for an existing key", function () {
		var key = {};
		var weakMap = new WeakMap([[key, 1]]);
		proclaim.throws(function () {
			weakMap.getOrInsertComputed(key, null);
		}, TypeError);
	});

	it("throws for an invalid `this`", function () {
		proclaim.throws(function () {
			WeakMap.prototype.getOrInsertComputed.call({}, {}, function () {});
		}, TypeError);
	});
});
