/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.3.4 Iterator.prototype.take ( limit )
CreateMethodProperty(Iterator.prototype, "take", function take(limit) {
	return IteratorHelpersUtils.iteratorPrototype.take(this, limit);
});
