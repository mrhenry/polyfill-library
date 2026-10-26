/* global Symbol, WeakMap */

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
	it("returns the existing value and leaves the map unchanged", function () {
		var key = {};
		var weakMap = new WeakMap([[key, 1]]);
		proclaim.strictEqual(weakMap.getOrInsert(key, 2), 1);
		proclaim.strictEqual(weakMap.get(key), 1);
	});

	it("inserts and returns the value for a new key", function () {
		var key = {};
		var weakMap = new WeakMap();
		proclaim.strictEqual(weakMap.getOrInsert(key, 1), 1);
		proclaim.strictEqual(weakMap.get(key), 1);
	});

	it("throws for a key that can't be held weakly", function () {
		var weakMap = new WeakMap();
		proclaim.throws(function () {
			weakMap.getOrInsert("a", 1);
		}, TypeError);
		proclaim.throws(function () {
			weakMap.getOrInsert(null, 1);
		}, TypeError);
	});

	if ("Symbol" in self && "for" in Symbol) {
		it("throws for a registered symbol", function () {
			var weakMap = new WeakMap();
			proclaim.throws(function () {
				weakMap.getOrInsert(Symbol.for("registered"), 1);
			}, TypeError);
		});
	}

	it("throws for an invalid `this`", function () {
		proclaim.throws(function () {
			WeakMap.prototype.getOrInsert.call({}, {}, 1);
		}, TypeError);
	});
});
