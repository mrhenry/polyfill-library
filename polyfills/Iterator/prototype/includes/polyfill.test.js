/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.includes);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.includes, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.includes, "includes");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "includes");
});

describe("includes", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should check whether an iterator includes an element", function () {
		proclaim.isTrue(new TestIterator(["a", "b", "c"]).includes("a"));
		proclaim.isTrue(new TestIterator(["a", "b", "c"]).includes("b", 1));
		proclaim.isFalse(new TestIterator(["a", "b", "c"]).includes("d"));
		proclaim.isFalse(new TestIterator(["a", "b", "c"]).includes("b", 2));
		proclaim.isFalse(new TestIterator(["a", "b", "c"]).includes("b", Infinity));
	});

	it("should throw for invalid `skippedElements`", function () {
		proclaim.throws(function () {
			new TestIterator(["a", "b", "c"]).includes("a", NaN);
		}, TypeError);
		proclaim.throws(function () {
			new TestIterator(["a", "b", "c"]).includes("a", -1);
		}, TypeError);
		proclaim.throws(function () {
			new TestIterator(["a", "b", "c"]).includes("a", -Infinity);
		}, TypeError);
		proclaim.throws(function () {
			new TestIterator(["a", "b", "c"]).includes("a", .5);
		}, TypeError);
		proclaim.throws(function () {
			new TestIterator(["a", "b", "c"]).includes("a", Number.MAX_SAFE_INTEGER + 1);
		}, TypeError);
	});
});
