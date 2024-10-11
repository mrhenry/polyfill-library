/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.3.5 Iterator.prototype.drop ( limit )
CreateMethodProperty(Iterator.prototype, "drop", function drop(limit) {
	return IteratorHelpersUtils.iteratorPrototype.drop.call(this, limit);
});
