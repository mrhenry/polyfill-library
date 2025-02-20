/* global CreateMethodProperty, Symbol, Type */
// this is based on https://github.com/es-shims/Error.isError/blob/main/implementation.js
// 20.5.2.1 Error.isError ( arg )
CreateMethodProperty(Error, "isError", function isError(arg) {
	// 1. If argument is not an Object, return false.
	if (Type(arg) !== "object") {
		return false;
	}
	// 2. If argument has an [[ErrorData]] internal slot, return true.
	// 3. Return false.
	if ("structuredClone" in self) {
		try {
			return self.structuredClone(arg) instanceof Error;
		} catch (e) {
			return false;
		}
	}
	if (!(Symbol.toStringTag in arg)) {
		var str = Object.prototype.toString.call(arg);
		return str === "[object Error]" || str === "[object DOMException]";
	}
	return arg instanceof Error;
});
