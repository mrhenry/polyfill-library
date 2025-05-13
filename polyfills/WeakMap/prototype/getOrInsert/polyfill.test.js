/* globals WeakMap */

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

it("gets", function () {
	var keyA = {};
	var map = new WeakMap([[keyA, 1]]);
	proclaim.equal(map.getOrInsert(keyA, 2), 1);
	proclaim.equal(map.get(keyA), 1);
});

it("inserts", function () {
	var keyA = {};
	var keyB = {};
	var map = new WeakMap([[keyA, 1]]);
	proclaim.equal(map.getOrInsert(keyB, 2), 2);
	proclaim.equal(map.get(keyA), 1);
	proclaim.equal(map.get(keyB), 2);
});

it("throws for an incompatible receiver", function () {
	proclaim.throws(function () {
		WeakMap.prototype.getOrInsert.call({});
	}, TypeError);
});

it("throws when key cannot be held weakly", function () {
	proclaim.throws(function () {
		new WeakMap().getOrInsert("a", 1);
	}, TypeError);
});
