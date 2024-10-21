/* global CreateMethodProperty, Iterator, Symbol */
// 27.1.4.13 Iterator.prototype [ %Symbol.iterator% ] ( )
CreateMethodProperty(Iterator.prototype, Symbol.iterator, function () {
	return this;
});
