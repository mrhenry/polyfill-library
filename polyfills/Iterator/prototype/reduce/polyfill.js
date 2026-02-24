/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.3.7 Iterator.prototype.reduce ( reducer [ , initialValue ] )
CreateMethodProperty(
	Iterator.prototype,
	"reduce",
	function reduce(reducer /* , initialValue */) {
		if (arguments.length > 1) {
			return IteratorHelpers.iteratorPrototype.reduce(
				this,
				reducer,
				arguments[1]
			);
		} else {
			return IteratorHelpers.iteratorPrototype.reduce(this, reducer);
		}
	}
);
