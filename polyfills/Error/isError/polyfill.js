/* global CreateMethodProperty, Symbol, Type */
// this is inspired by https://github.com/es-shims/Error.isError/blob/main/implementation.js
// 20.5.2.1 Error.isError ( arg )
CreateMethodProperty(Error, "isError", function isError(arg) {
	// 1. If argument is not an Object, return false.
	if (Type(arg) !== "object") {
		return false;
	}

	// If the argument is an instance of Error, return true.
	if (arg instanceof Error) {
		return true;
	}

	// If the browser supports `Symbol.toStringTag` it is possible to spoof the result of calling `Object.prototype.toString`, return false.
	if ('Symbol' in self && 'toStringTag' in Symbol && Symbol.toStringTag in arg) {
		return false;
	}

	// If `Object.prototype.toString` indicates it is an error, return true
	var str = Object.prototype.toString.call(arg);
	if (str === "[object Error]" || str === "[object DOMException]") {
		return true;
	}

	// Return true.
	return false;
});
