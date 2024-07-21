/* globals Symbol, Int8Array */

// use "Int8Array" as a proxy for all "TypedArray" subclasses

it('is an alias to %TypedArray%.prototype.values', function () {
	if ('__proto__' in Int8Array.prototype && self.Int8Array.prototype.__proto__ !== Object.prototype) {
		proclaim.isDefined(Int8Array.prototype.__proto__[Symbol.iterator]);
		proclaim.deepEqual(Int8Array.prototype.__proto__[Symbol.iterator], Int8Array.prototype.__proto__.values);
	} else {
		proclaim.isDefined(Int8Array.prototype[Symbol.iterator]);
		proclaim.deepEqual(Int8Array.prototype[Symbol.iterator], Int8Array.prototype.values);
	}
});
