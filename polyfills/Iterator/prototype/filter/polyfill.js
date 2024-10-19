/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.3.3 Iterator.prototype.filter ( predicate )
CreateMethodProperty(Iterator.prototype, "filter", function filter(predicate) {
	return IteratorHelpersUtils.iteratorPrototype.filter.call(this, predicate);
});
