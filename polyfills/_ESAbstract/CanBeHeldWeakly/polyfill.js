/* global Symbol, Type */
// 9.13 CanBeHeldWeakly ( arg )
// eslint-disable-next-line no-unused-vars
function CanBeHeldWeakly(arg) {
	// 1. If arg is an Object, return true.
	if (Type(arg) === "object") {
		return true;
	}
	// 2. If arg is a Symbol and KeyForSymbol(arg) is undefined, return true.
	if (Type(arg) === "symbol" && Symbol.keyFor(arg) === undefined) {
		return true;
	}
	// 3. Return false.
	return false;
}
