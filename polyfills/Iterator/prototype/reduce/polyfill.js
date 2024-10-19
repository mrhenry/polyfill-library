/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.3.7 Iterator.prototype.reduce ( reducer [ , initialValue ] )
CreateMethodProperty(
	Iterator.prototype,
	"reduce",
	// eslint-disable-next-line no-unused-vars
	function reduce(reducer /* , initialValue */) {
		return IteratorHelpersUtils.iteratorPrototype.reduce.apply(this, arguments);
	}
);
