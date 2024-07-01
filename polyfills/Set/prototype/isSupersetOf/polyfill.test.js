/* global Set */

it("is a function", function () {
	proclaim.isFunction(Set.prototype.isSupersetOf);
});

it("has correct arity", function () {
	proclaim.arity(Set.prototype.isSupersetOf, 1);
});

it("has correct name", function () {
	proclaim.hasName(Set.prototype.isSupersetOf, "isSupersetOf");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Set.prototype, "isSupersetOf");
});

describe("isSupersetOf", function () {
	it("should compute whether a set is a superset of another set", function () {
		proclaim.isTrue(new Set([1, 2, 3]).isSupersetOf(new Set([2, 3])));

		proclaim.isFalse(new Set([1, 2]).isSupersetOf(new Set([1, 2, 3])));
		proclaim.isFalse(new Set([2, 3, 4]).isSupersetOf(new Set([1, 2])));
	});

	it("should throw for an invalid `this`", function () {
		proclaim.throws(function () {
			Set.prototype.isSupersetOf.call({}, new Set());
		}, TypeError);
	});

	it("should throw for an invalid `other`", function () {
		proclaim.throws(function () {
			Set.prototype.isSupersetOf.call(new Set(), {});
		}, TypeError);
	});
});
