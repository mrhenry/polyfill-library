/* global Set */

it("is a function", function () {
	proclaim.isFunction(Set.prototype.difference);
});

it("has correct arity", function () {
	proclaim.arity(Set.prototype.difference, 1);
});

it("has correct name", function () {
	proclaim.hasName(Set.prototype.difference, "difference");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Set.prototype, "difference");
});

describe("difference", function () {
	it("should compute the difference of a set with a smaller set", function () {
		var set = new Set([1, 2, 3]).difference(new Set([3, 4]));
		proclaim.equal(set.size, 2);
		proclaim.isTrue(set.has(1));
		proclaim.isTrue(set.has(2));
	});

	it("should compute the difference of a set with a larger set", function () {
		var set = new Set([3, 4]).difference(new Set([1, 2, 3]));
		proclaim.equal(set.size, 1);
		proclaim.isTrue(set.has(4));
	});

	it("should throw for an invalid `this`", function () {
		proclaim.throws(function () {
			Set.prototype.difference.call({}, new Set());
		}, TypeError);
	});

	it("should throw for an invalid `other`", function () {
		proclaim.throws(function () {
			Set.prototype.difference.call(new Set(), {});
		}, TypeError);
	});
});
