/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.3.10 Iterator.prototype.some ( predicate )
CreateMethodProperty(Iterator.prototype, "some", function some(predicate) {
	return IteratorHelpers.iteratorPrototype.some(this, predicate);
});
