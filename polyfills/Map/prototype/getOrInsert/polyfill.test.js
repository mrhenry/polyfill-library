/* globals Map */

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

it("gets", function () {
	var map = new Map([
		["a", 1],
		[-0, 1]
	]);
	proclaim.equal(map.getOrInsert("a", 2), 1);
	proclaim.equal(map.get("a"), 1);
	proclaim.equal(map.getOrInsert(0, 2), 1);
	proclaim.equal(map.get(0), 1);
});

it("inserts", function () {
	var map = new Map([["a", 1]]);
	proclaim.equal(map.getOrInsert("b", 2), 2);
	proclaim.equal(map.get("a"), 1);
	proclaim.equal(map.get("b"), 2);
	proclaim.equal(map.getOrInsert(-0, 1), 1);
	proclaim.equal(map.get(0), 1);
});

it("throws for an incompatible receiver", function () {
	proclaim.throws(function () {
		Map.prototype.getOrInsert.call({});
	}, TypeError);
});
