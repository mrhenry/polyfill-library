(function() {
	"use strict";

	MediaQueryList.prototype.addEventListener = function addEventListener(type, listener) {
		if (type === 'change') {
			this.addListener(listener);
		}
	};

	MediaQueryList.prototype.removeEventListener = function removeEventListener(type, listener) {
		if (type === 'change') {
			this.removeListener(listener);
		}
	};
}());
