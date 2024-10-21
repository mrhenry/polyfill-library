/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.3.12 Iterator.prototype.find ( predicate )
CreateMethodProperty(Iterator.prototype, "find", function find(predicate) {
	return IteratorHelpersUtils.iteratorPrototype.find(this, predicate);
});
