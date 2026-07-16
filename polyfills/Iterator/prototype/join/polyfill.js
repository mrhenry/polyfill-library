/* global CreateMethodProperty, Get, Iterator, IteratorClose, IteratorStepValue, ThrowCompletion, ToString, Type */
// TODO
CreateMethodProperty(Iterator.prototype, "join", function join(separator) {
	// 1. Let O be the this value.
	var O = this;
	// 2. If O is not an Object, throw a TypeError exception.
	if (Type(O) !== "object") {
		throw new TypeError("`this` is not an object");
	}
	// 3. Let iterated be the Iterator Record { [[Iterator]]: O, [[NextMethod]]: undefined, [[Done]]: false }.
	var iterated = {
		"[[Iterator]]": O,
		"[[NextMethod]]": undefined,
		"[[Done]]": false
	};
	// 4. If separator is undefined, then
	if (separator === undefined) {
		// a. Let sep be ",".
		var sep = ",";
	}
	// 5. Else,
	else {
		// a. Let sep be Completion(ToString(separator)).
		try {
			sep = ToString(separator);
		}
		// b. IfAbruptCloseIterator(sep, iterated).
		catch (error) {
			return IteratorClose(iterated, ThrowCompletion(error));
		}
	}
	// 6. Set iterated to ? GetIteratorDirect(O).
	iterated = {
		"[[Iterator]]": O,
		"[[NextMethod]]": Get(O, "next"),
		"[[Done]]": false
	};
	// 7. Let R be the empty String.
	var R = "";
	// 8. Let first be true.
	var first = true;
	// 9. Repeat,
	while (true) {
		// a. Let value be ? IteratorStepValue(iterated).
		var value = IteratorStepValue(iterated);
		// b. If value is DONE, return R.
		if (value === IteratorStepValue.DONE) {
			return R;
		}
		// c. If first is true, then
		if (first === true) {
			// i. Set first to false.
			first = false;
		}
		// d. Else,
		else {
			// i. Set R to the string-concatenation of R and sep.
			R += sep;
		}
		// e. If value is neither undefined nor null, then
		if (value !== undefined && value !== null) {
			// i. Let S be Completion(ToString(value)).
			try {
				var S = ToString(value);
			}
			// ii. IfAbruptCloseIterator(S, iterated).
			catch (error) {
				return IteratorClose(iterated, ThrowCompletion(error));
			}
			// iii. Set R to the string-concatenation of R and S.
			R += S;
		}
	}
});
