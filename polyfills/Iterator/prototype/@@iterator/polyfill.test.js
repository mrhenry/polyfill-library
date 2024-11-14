/* globals Iterator, Symbol */

it("is a function", function () {
	proclaim.isFunction(Iterator.prototype[Symbol.iterator]);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.prototype[Symbol.iterator], 0);
});

// TODO: Look into this
// it('has correct name', function () {
// 	proclaim.hasName(Iterator.prototype[Symbol.iterator], '[Symbol.iterator]');
// });

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator.prototype, Symbol.iterator);
});

it("returns itself", function () {
	function TestIterator(arr) {
		var i = -1;
		this.next = function () {
			i++;
			return { value: arr[i], done: i >= arr.length };
		};
	}
	TestIterator.prototype = Iterator.prototype;

	var iterator = new TestIterator([1, 2, 3]);

	proclaim.equal(iterator[Symbol.iterator](), iterator);
});
