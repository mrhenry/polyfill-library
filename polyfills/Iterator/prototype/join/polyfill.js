/* global CreateMethodProperty, Get, Iterator, IteratorClose, IteratorStepValue, ThrowCompletion, ToString, Type */
// 27.1.3.3.10 Iterator.prototype.join ( separator )
CreateMethodProperty(Iterator.prototype, "join", function join(separator) {
	// 1. Let obj be the this value.
	var obj = this;
	// 2. If obj is not an Object, throw a TypeError exception.
	if (Type(obj) !== "object") {
		throw new TypeError("`this` is not an object");
	}
	// 3. Let iterated be the Iterator Record { [[Iterator]]: obj, [[NextMethod]]: undefined, [[Done]]: false }.
	var iterated = {
		"[[Iterator]]": obj,
		"[[NextMethod]]": undefined,
		"[[Done]]": false
	};
	// 4. If separator is undefined, then
	if (separator === undefined) {
		// a. Let separatorString be ",".
		var separatorString = ",";
	}
	// 5. Else,
	else {
		// a. Let separatorString be Completion(ToString(separator)).
		try {
			separatorString = ToString(separator);
		}
		// b. IfAbruptCloseIterator(separatorString, iterated).
		catch (error) {
			return IteratorClose(iterated, ThrowCompletion(error));
		}
	}
	// 6. Set iterated to ? GetIteratorDirect(obj).
	iterated = {
		"[[Iterator]]": obj,
		"[[NextMethod]]": Get(obj, "next"),
		"[[Done]]": false
	};
	// 7. Let result be the empty String.
	var result = "";
	// 8. Let first be true.
	var first = true;
	// 9. Repeat,
	while (true) {
		// a. Let value be ? IteratorStepValue(iterated).
		var value = IteratorStepValue(iterated);
		// b. If value is DONE, return result.
		if (value === IteratorStepValue.DONE) {
			return result;
		}
		// c. If first is true, then
		if (first === true) {
			// i. Set first to false.
			first = false;
		}
		// d. Else,
		else {
			// i. Set result to the string-concatenation of result and separatorString.
			result += separatorString;
		}
		// e. If value is neither undefined nor null, then
		if (value !== undefined && value !== null) {
			// i. Let valueString be Completion(ToString(value)).
			try {
				var valueString = ToString(value);
			}
			// ii. IfAbruptCloseIterator(valueString, iterated).
			catch (error) {
				return IteratorClose(iterated, ThrowCompletion(error));
			}
			// iii. Set result to the string-concatenation of result and valueString.
			result += valueString;
		}
	}
});
