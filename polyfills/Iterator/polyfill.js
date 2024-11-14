/* global CreateMethodProperty */
// 27.1.3.1 The Iterator Constructor
(function () {
	function Iterator() {
		if (
			!(this instanceof Iterator) ||
			this.constructor === Iterator ||
			!Object.prototype.isPrototypeOf.call(Iterator, this.constructor)
		) {
			throw new TypeError(
				"`Iterator` can not be called or constructed directly"
			);
		}
	}

	if (
		self.Symbol &&
		self.Symbol.iterator &&
		Array.prototype[self.Symbol.iterator]
	) {
		Iterator.prototype = Object.getPrototypeOf(
			Object.getPrototypeOf(Array.prototype[self.Symbol.iterator]())
		);
	}

	CreateMethodProperty(self, "Iterator", Iterator);
})();
