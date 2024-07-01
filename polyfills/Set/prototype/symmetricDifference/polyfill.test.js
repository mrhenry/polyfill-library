/* global Set */

it("is a function", function () {
	proclaim.isFunction(Set.prototype.symmetricDifference);
});

it("has correct arity", function () {
	proclaim.arity(Set.prototype.symmetricDifference, 1);
});

it("has correct name", function () {
	proclaim.hasName(Set.prototype.symmetricDifference, "symmetricDifference");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Set.prototype, "symmetricDifference");
});

describe("symmetricDifference", function () {
	it("should compute the symmetric difference of a set with a smaller set", function () {
		var set = new Set([1, 2, 3]).symmetricDifference(new Set([3, 4]));
		proclaim.equal(set.size, 3);
		proclaim.isTrue(set.has(1));
		proclaim.isTrue(set.has(2));
		proclaim.isTrue(set.has(4));
	});

	it("should compute the symmetric difference of a set with a larger set", function () {
		var set = new Set([3, 4]).symmetricDifference(new Set([1, 2, 3]));
		proclaim.equal(set.size, 3);
		proclaim.isTrue(set.has(1));
		proclaim.isTrue(set.has(2));
		proclaim.isTrue(set.has(4));
	});

	it("should throw for an invalid `this`", function () {
		proclaim.throws(function () {
			Set.prototype.symmetricDifference.call({}, new Set());
		}, TypeError);
	});

	it("should throw for an invalid `other`", function () {
		proclaim.throws(function () {
			Set.prototype.symmetricDifference.call(new Set(), {});
		}, TypeError);
	});
});
