/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.3.2 Iterator.prototype.map ( mapper )
CreateMethodProperty(Iterator.prototype, "map", function map(mapper) {
	return IteratorHelpers.iteratorPrototype.map(this, mapper);
});
