/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.3.2 Iterator.prototype.map ( mapper )
CreateMethodProperty(Iterator.prototype, "map", function map(mapper) {
	return IteratorHelpersUtils.iteratorPrototype.map(this, mapper);
});
