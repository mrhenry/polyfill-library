/* global CreateMethodProperty, Iterator, IteratorHelpers */
// 3.1.1.2.2 Iterator.from ( O )
CreateMethodProperty(Iterator, "from", function from(O) {
	return IteratorHelpers.iterator.from(O);
});
