/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.3.11 Iterator.prototype.every ( predicate )
CreateMethodProperty(Iterator.prototype, "every", function every(predicate) {
	return IteratorHelpersUtils.iteratorPrototype.every(this, predicate);
});
