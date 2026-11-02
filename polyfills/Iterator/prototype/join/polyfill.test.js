/* global Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype.join);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype.join, 1);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.prototype.join, "join");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, "join");
});

describe("join", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	it("should join elements of an iterator", function () {
		proclaim.equal(new TestIterator(["a", "b", "c"]).join(), "a,b,c");
		proclaim.equal(new TestIterator(["a", "b", "c"]).join("."), "a.b.c");
	});

	if ("Symbol" in self) {
		var sym = self.Symbol("test");

		it("should throw for a symbol element", function () {
			proclaim.throws(function () {
				new TestIterator([sym]).join();
			}, TypeError);
		});

		it("should throw for a symbol separator", function () {
			proclaim.throws(function () {
				new TestIterator([]).join(sym);
			}, TypeError);
		});
	}
});
