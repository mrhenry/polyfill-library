/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.3.8 Iterator.prototype.toArray ( )
CreateMethodProperty(Iterator.prototype, "toArray", function toArray() {
	return IteratorHelpers.iteratorPrototype.toArray(this);
});
