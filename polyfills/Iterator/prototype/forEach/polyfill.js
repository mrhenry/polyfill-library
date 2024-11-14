/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.3.9 Iterator.prototype.forEach ( fn )
CreateMethodProperty(Iterator.prototype, "forEach", function forEach(fn) {
	return IteratorHelpersUtils.iteratorPrototype.forEach(this, fn);
});
