/* global CreateMethodProperty, Symbol, Type */
// this is inspired by https://github.com/es-shims/Error.isError/blob/main/implementation.js
// 20.5.2.1 Error.isError ( arg )
CreateMethodProperty(Error, "isError", function isError(arg) {
	// 1. If argument is not an Object, return false.
	if (Type(arg) !== "object") {
		return false;
	}
	// 2. If argument has an [[ErrorData]] internal slot, return true.
	// 3. Return false.
	if (!(Symbol.toStringTag in arg)) {
		var str = Object.prototype.toString.call(arg);
		return str === "[object Error]" || str === "[object DOMException]";
	}
	return arg instanceof Error;
});
