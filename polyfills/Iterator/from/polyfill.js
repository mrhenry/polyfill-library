/* global CreateMethodProperty, Iterator, IteratorHelpersUtils */
// 3.1.1.2.2 Iterator.from ( O )
CreateMethodProperty(Iterator, "from", function from(O) {
	return IteratorHelpersUtils.iterator.from(this, O);
});
