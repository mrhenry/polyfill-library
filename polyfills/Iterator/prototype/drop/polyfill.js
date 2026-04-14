/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.3.5 Iterator.prototype.drop ( limit )
CreateMethodProperty(Iterator.prototype, "drop", function drop(limit) {
	return IteratorHelpers.iteratorPrototype.drop(this, limit);
});
