/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.3.12 Iterator.prototype.find ( predicate )
CreateMethodProperty(Iterator.prototype, "find", function find(predicate) {
	return IteratorHelpers.iteratorPrototype.find(this, predicate);
});
