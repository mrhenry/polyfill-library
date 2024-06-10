/* global Set */

it("is a function", function () {
	proclaim.isFunction(Set.prototype.isSubsetOf);
});

it("has correct arity", function () {
	proclaim.arity(Set.prototype.isSubsetOf, 1);
});

it("has correct name", function () {
	proclaim.hasName(Set.prototype.isSubsetOf, "isSubsetOf");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Set.prototype, "isSubsetOf");
});

describe("isSubsetOf", function () {
	it("should compute whether a set is a subset of another set", function () {
		proclaim.isTrue(new Set([1, 2]).isSubsetOf(new Set([1, 2, 3])));

		proclaim.isFalse(new Set([1, 2, 3]).isSubsetOf(new Set([2, 3])));
		proclaim.isFalse(new Set([1, 2]).isSubsetOf(new Set([2, 3, 4])));
	});

	it("should throw for an invalid `this`", function () {
		proclaim.throws(function () {
			Set.prototype.isSubsetOf.call({}, new Set());
		}, TypeError);
	});

	it("should throw for an invalid `other`", function () {
		proclaim.throws(function () {
			Set.prototype.isSubsetOf.call(new Set(), {});
		}, TypeError);
	});
});
