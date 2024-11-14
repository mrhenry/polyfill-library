/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.3.10 Iterator.prototype.some ( predicate )
CreateMethodProperty(Iterator.prototype, "some", function some(predicate) {
	return IteratorHelpersUtils.iteratorPrototype.some(this, predicate);
});
