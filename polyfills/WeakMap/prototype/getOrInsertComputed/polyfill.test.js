/* globals WeakMap */

it("is a function", function () {
	proclaim.isFunction(WeakMap.prototype.getOrInsertComputed);
});

it("has correct arity", function () {
	proclaim.arity(WeakMap.prototype.getOrInsertComputed, 2);
});

it("has correct name", function () {
	proclaim.hasName(
		WeakMap.prototype.getOrInsertComputed,
		"getOrInsertComputed"
	);
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(WeakMap.prototype, "getOrInsertComputed");
});

var thrower = function () {
	throw new Error("uh oh");
};

it("gets", function () {
	var keyA = {};
	var map = new WeakMap([[keyA, 1]]);
	proclaim.equal(map.getOrInsertComputed(keyA, thrower), 1);
	proclaim.equal(map.get(keyA), 1);
});

it("inserts", function () {
	var keyA = {};
	var keyB = { k: "b" };
	var map = new WeakMap([[keyA, 1]]);
	proclaim.equal(
		map.getOrInsertComputed(keyB, function (key) {
			return key.k + 2;
		}),
		"b2"
	);
	proclaim.equal(map.get(keyA), 1);
	proclaim.equal(map.get(keyB), "b2");
});

it("inserts when callbackfn has modified the receiver", function () {
	var keyA = {};
	var map = new WeakMap();
	proclaim.equal(
		map.getOrInsertComputed(keyA, function () {
			map.set(keyA, 1);
			return 2;
		}),
		2
	);
	proclaim.equal(map.get(keyA), 2);
});

it("throws for an incompatible receiver", function () {
	proclaim.throws(function () {
		WeakMap.prototype.getOrInsertComputed.call({}, {}, function () {});
	}, TypeError);
});

it("throws when key cannot be held weakly", function () {
	proclaim.throws(function () {
		new WeakMap().getOrInsertComputed("a", function () {});
	}, TypeError);
});

it("throws when callbackfn is not callable", function () {
	var keyA = {};
	proclaim.throws(function () {
		new WeakMap([[keyA, 1]]).getOrInsertComputed(keyA, "x");
	}, TypeError);
});

it("throws when callbackfn throws", function () {
	proclaim.throws(function () {
		new WeakMap().getOrInsertComputed({}, thrower);
	}, /uh oh/);
});
