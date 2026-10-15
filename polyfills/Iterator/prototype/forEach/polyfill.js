/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.3.9 Iterator.prototype.forEach ( fn )
CreateMethodProperty(Iterator.prototype, "forEach", function forEach(fn) {
	return IteratorHelpers.iteratorPrototype.forEach(this, fn);
});
