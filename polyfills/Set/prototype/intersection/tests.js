/* global Set */

it("is a function", function () {
	proclaim.isFunction(Set.prototype.intersection);
});

it("has correct arity", function () {
	proclaim.arity(Set.prototype.intersection, 1);
});

it("has correct name", function () {
	proclaim.hasName(Set.prototype.intersection, "intersection");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Set.prototype, "intersection");
});

describe("intersection", function () {
	it("should compute the intersection of a set with a smaller set", function () {
		var set = new Set([1, 2, 3]).intersection(new Set([3, 4]));
		proclaim.equal(set.size, 1);
		proclaim.isTrue(set.has(3));
	});

	it("should compute the intersection of a set with a larger set", function () {
		var set = new Set([3, 4]).intersection(new Set([1, 2, 3]));
		proclaim.equal(set.size, 1);
		proclaim.isTrue(set.has(3));
	});

	it("should throw for an invalid `this`", function () {
		proclaim.throws(function () {
			Set.prototype.intersection.call({}, new Set());
		}, TypeError);
	});

	it("should throw for an invalid `other`", function () {
		proclaim.throws(function () {
			Set.prototype.intersection.call(new Set(), {});
		}, TypeError);
	});
});
