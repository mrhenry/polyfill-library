/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.3.3 Iterator.prototype.filter ( predicate )
CreateMethodProperty(Iterator.prototype, "filter", function filter(predicate) {
	return IteratorHelpers.iteratorPrototype.filter(this, predicate);
});
