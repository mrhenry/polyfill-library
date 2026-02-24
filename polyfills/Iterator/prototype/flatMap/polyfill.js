/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.3.6 Iterator.prototype.flatMap ( mapper )
CreateMethodProperty(Iterator.prototype, "flatMap", function flatMap(mapper) {
	return IteratorHelpers.iteratorPrototype.flatMap(this, mapper);
});
