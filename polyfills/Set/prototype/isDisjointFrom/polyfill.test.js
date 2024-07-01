/* global Set */

it("is a function", function () {
	proclaim.isFunction(Set.prototype.isDisjointFrom);
});

it("has correct arity", function () {
	proclaim.arity(Set.prototype.isDisjointFrom, 1);
});

it("has correct name", function () {
	proclaim.hasName(Set.prototype.isDisjointFrom, "isDisjointFrom");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Set.prototype, "isDisjointFrom");
});

describe("isDisjointFrom", function () {
	it("should compute whether a set is disjoint from a smaller set", function () {
		proclaim.isTrue(new Set([1, 2, 3]).isDisjointFrom(new Set([4])));

		proclaim.isFalse(new Set([1, 2, 3]).isDisjointFrom(new Set([1, 2])));
		proclaim.isFalse(new Set([1, 2, 3]).isDisjointFrom(new Set([1, 4])));
	});

	it("should compute whether a set is disjoint from a larger set", function () {
		proclaim.isTrue(new Set([4]).isDisjointFrom(new Set([1, 2, 3])));

		proclaim.isFalse(new Set([1, 2]).isDisjointFrom(new Set([1, 2, 3])));
		proclaim.isFalse(new Set([1, 4]).isDisjointFrom(new Set([1, 2, 3])));
	});

	it("should throw for an invalid `this`", function () {
		proclaim.throws(function () {
			Set.prototype.isDisjointFrom.call({}, new Set());
		}, TypeError);
	});

	it("should throw for an invalid `other`", function () {
		proclaim.throws(function () {
			Set.prototype.isDisjointFrom.call(new Set(), {});
		}, TypeError);
	});
});
