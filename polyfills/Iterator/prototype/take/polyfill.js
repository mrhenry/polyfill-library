/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.3.4 Iterator.prototype.take ( limit )
CreateMethodProperty(Iterator.prototype, "take", function take(limit) {
	return IteratorHelpers.iteratorPrototype.take(this, limit);
});
