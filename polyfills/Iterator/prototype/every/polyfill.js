/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.3.11 Iterator.prototype.every ( predicate )
CreateMethodProperty(Iterator.prototype, "every", function every(predicate) {
	return IteratorHelpers.iteratorPrototype.every(this, predicate);
});
