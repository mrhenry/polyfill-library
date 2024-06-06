/* global Set */

it("is a function", function () {
	proclaim.isFunction(Set.prototype.union);
});

it("has correct arity", function () {
	proclaim.arity(Set.prototype.union, 1);
});

it("has correct name", function () {
	proclaim.hasName(Set.prototype.union, "union");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Set.prototype, "union");
});

describe("union", function () {
	it("should compute the union of a set with another set", function () {
		var set = new Set([1, 2]).union(new Set([2, 3]));
		proclaim.equal(set.size, 3);
		proclaim.isTrue(set.has(1));
		proclaim.isTrue(set.has(2));
		proclaim.isTrue(set.has(3));
	});

	it("should throw for an invalid `this`", function () {
		proclaim.throws(function () {
			Set.prototype.union.call({}, new Set());
		}, TypeError);
	});

	it("should throw for an invalid `other`", function () {
		proclaim.throws(function () {
			Set.prototype.union.call(new Set(), {});
		}, TypeError);
	});
});
