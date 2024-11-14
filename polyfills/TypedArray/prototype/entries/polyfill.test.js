/* global Int8Array, Iterator */

// use "Int8Array" as a proxy for all "TypedArray" subclasses

it('is a function', function () {
	proclaim.isFunction(Int8Array.prototype.entries);
});

it('has correct arity', function () {
	proclaim.arity(Int8Array.prototype.entries, 0);
});

it('has correct name', function () {
	proclaim.hasName(Int8Array.prototype.entries, 'entries');
});

it('is not enumerable', function () {
	if ('__proto__' in Int8Array.prototype && Int8Array.prototype.__proto__ !== Object.prototype) {
		proclaim.isNotEnumerable(Int8Array.prototype.__proto__, 'entries');
	} else {
		proclaim.isNotEnumerable(Int8Array.prototype, 'entries');
	}
});

describe('entries', function () {
	it('returns a next-able object', function () {
		var array = new Int8Array([10, 11]);
		var iterator = array.entries();

		proclaim.isInstanceOf(iterator.next, Function);
		proclaim.deepEqual(iterator.next(), {
			value: [0, 10],
			done: false
		});
	});

	it('returns an `Iterator`', function () {
		var iterator = new Int8Array([10, 11]).entries();
		proclaim.isInstanceOf(iterator, Iterator);
	});

	it('finally returns a done object', function () {
		var array = new Int8Array([10, 11]);
		var iterator = array.entries();
		iterator.next();
		iterator.next();
		proclaim.deepEqual(iterator.next(), {
			value: undefined,
			done: true
		});
	});

	it("returns an iterable", function () {
		proclaim.isDefined(new Int8Array().entries()[self.Symbol.iterator]);
	});
});
