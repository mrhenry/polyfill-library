/* globals Map */

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

var thrower = function () {
	throw new Error("uh oh");
};

it("gets", function () {
	var map = new Map([
		["a", 1],
		[-0, 1]
	]);
	proclaim.equal(map.getOrInsertComputed("a", thrower), 1);
	proclaim.equal(map.get("a"), 1);
	proclaim.equal(map.getOrInsertComputed(0, thrower), 1);
	proclaim.equal(map.get(0), 1);
});

it("inserts", function () {
	var map = new Map([["a", 1]]);
	proclaim.equal(
		map.getOrInsertComputed("b", function (key) {
			return key + 2;
		}),
		"b2"
	);
	proclaim.equal(map.get("a"), 1);
	proclaim.equal(map.get("b"), "b2");
	proclaim.equal(
		map.getOrInsertComputed(-0, function () {
			return 1;
		}),
		1
	);
	proclaim.equal(map.get(0), 1);
});

it("inserts when callbackfn has modified the receiver", function () {
	var map = new Map();
	proclaim.equal(
		map.getOrInsertComputed("a", function () {
			map.set("a", 1);
			return 2;
		}),
		2
	);
	proclaim.equal(map.get("a"), 2);
});

it("throws for an incompatible receiver", function () {
	proclaim.throws(function () {
		Map.prototype.getOrInsertComputed.call({}, "a", function () {});
	}, TypeError);
});

it("throws when callbackfn is not callable", function () {
	proclaim.throws(function () {
		new Map([["a", 1]]).getOrInsertComputed("a", "x");
	}, TypeError);
});

it("throws when callbackfn throws", function () {
	proclaim.throws(function () {
		new Map().getOrInsertComputed("a", thrower);
	}, /uh oh/);
});
