/* global CreateMethodProperty, Symbol, ToObject, ArrayIterator */
// 22.1.3.30/ Array.prototype.values ( )

var hasModernIterator = function () {
	// firefox 44 and below uses legacy iterators
	// https://github.com/zloirock/core-js/commit/bb3b34bbf92b1d1a7b50d3a5a445c84dc2fb5cd5#diff-25d2a16dc5a355ce40a572773be144d1c8e085a809633e42ec$
	var IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
	var test = {};
	return IteratorPrototype[Symbol.iterator].call(test) === test;
}

// Firefox, Chrome and Opera have Array.prototype[Symbol.iterator], which is the exact same function as Array.prototype.values.
if ('Symbol' in self && 'iterator' in Symbol && typeof Array.prototype[Symbol.iterator] === 'function' && hasModernIterator()) {
	CreateMethodProperty(Array.prototype, 'values', Array.prototype[Symbol.iterator]);
} else {
	CreateMethodProperty(Array.prototype, 'values', function values () {
		// 1. Let O be ? ToObject(this value).
		var O = ToObject(this);
		// 2. Return CreateArrayIterator(O, "value").
		// TODO: Add CreateArrayIterator
		return new ArrayIterator(O, 'value');
	});
}
