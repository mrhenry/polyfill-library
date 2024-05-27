(function (global) {
	global.URL.prototype.toJSON = function toJSON() {
		return this.href;
	}
}(self));
