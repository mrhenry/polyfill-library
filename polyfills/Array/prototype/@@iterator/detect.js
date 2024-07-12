'Symbol' in self && 'iterator' in self.Symbol && !!Array.prototype[self.Symbol.iterator] && (function () {
	// firefox 44 and below uses legacy iterators
	// https://github.com/zloirock/core-js/commit/bb3b34bbf92b1d1a7b50d3a5a445c84dc2fb5cd5#diff-25d2a16dc5a355ce40a572773be144d1c8e085a809633e42ec$
	var IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][self.Symbol.iterator]()));
	var test = {};
	return IteratorPrototype[self.Symbol.iterator].call(test) === test;
})()
