/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.3.8 Iterator.prototype.toArray ( )
CreateMethodProperty(Iterator.prototype, "toArray", function toArray() {
	return IteratorHelpersUtils.iteratorPrototype.toArray(this);
});
