/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator);
});

it("has correct arity", function () {
	proclaim.arity(Iterator, 0);
});

it("has correct name", function () {
	proclaim.hasName(Iterator, "Iterator");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(window, "Iterator");
});

it("cannot be constructed directly", function () {
	proclaim.throws(function () {
		new Iterator();
	}, /can not be called or constructed directly/);
});
