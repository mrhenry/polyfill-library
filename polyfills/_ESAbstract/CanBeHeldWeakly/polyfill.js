/* global WeakMap */
var weakMap = new WeakMap();

// 9.13 CanBeHeldWeakly ( v )
function CanBeHeldWeakly(v) { // eslint-disable-line no-unused-vars
	try {
		// 1. If v is an Object, return true.
		// 2. If v is a Symbol and KeyForSymbol(v) is undefined, return true.
		weakMap.set(v, 1);
		weakMap.delete(v, 1);
		return true;
	} catch (_) {
		// 3. Return false.
		return false;
	}
}
