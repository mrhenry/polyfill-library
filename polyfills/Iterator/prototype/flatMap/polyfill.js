/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.3.6 Iterator.prototype.flatMap ( mapper )
CreateMethodProperty(Iterator.prototype, "flatMap", function flatMap(mapper) {
	return IteratorHelpersUtils.iteratorPrototype.flatMap(this, mapper);
});
