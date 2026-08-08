/* global Call, Get, GetMethod, Symbol, Type */
// 7.4.5 GetIteratorFlattenable ( obj, primitiveHandling )
function GetIteratorFlattenable(obj, primitiveHandling) { // eslint-disable-line no-unused-vars
	// 1. If obj is not an Object, then
	if (Type(obj) !== "object") {
		// a. If primitiveHandling is REJECT-PRIMITIVES, throw a TypeError exception.
		if (primitiveHandling === "reject-primitives") {
			throw new TypeError("argument must be an object");
		}
		// b. Assert: primitiveHandling is ITERATE-STRING-PRIMITIVES.
		// c. If obj is not a String, throw a TypeError exception.
		if (typeof obj !== "string") {
			throw new TypeError("argument must be a string");
		}
	}
	// 2. Let method be ? GetMethod(obj, %Symbol.iterator%).
	var method = GetMethod(obj, Symbol.iterator);
	// 3. If method is undefined, then
	var iterator;
	if (method === undefined) {
		// a. Let iterator be obj.
		iterator = obj;
	}
	// 4. Else,
	else {
		// a. Let iterator be ? Call(method, obj).
		iterator = Call(method, obj);
	}
	// 5. If iterator is not an Object, throw a TypeError exception.
	if (Type(iterator) !== "object") {
		throw new TypeError("iterator must be an object");
	}
	// 6. Return ? GetIteratorDirect(iterator).
	return {
		"[[Iterator]]": iterator,
		"[[NextMethod]]": Get(iterator, "next")
	};
}
