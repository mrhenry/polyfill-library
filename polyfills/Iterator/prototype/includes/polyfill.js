/* global CreateMethodProperty, Get, IsInteger, Iterator, IteratorClose, IteratorStepValue, NormalCompletion, SameValueZero, ThrowCompletion, Type */
// TODO
CreateMethodProperty(Iterator.prototype, "includes", function includes(searchElement /* , skippedElements */) {
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
	// 4. If skippedElements is undefined, then
	var skippedElements = arguments[1];
	if (skippedElements === undefined) {
		// a. Let toSkip be +0𝔽.
		var toSkip = 0;
	}
	// 5. Else,
	else {
		// a. If skippedElements is not one of +∞𝔽, -∞𝔽, or an integral Number, then
		if (skippedElements !== Infinity && skippedElements !== -Infinity && !IsInteger(skippedElements)) {
			// i. Let error be ThrowCompletion(a newly created TypeError object).
			var error = ThrowCompletion(new TypeError("`skippedElements` is not an integer"));
			// ii. Return ? IteratorClose(iterated, error).
			return IteratorClose(iterated, error);
		}
		// b. Let toSkip be skippedElements.
		toSkip = skippedElements;
	}
	// 6. If toSkip < -0𝔽, then
	if (toSkip < 0) {
		// a. Let error be ThrowCompletion(a newly created RangeError object).
		error = ThrowCompletion(new TypeError("`skippedElements` is negative"));
		// b. Return ? IteratorClose(iterated, error).
		return IteratorClose(iterated, error);
	}
	// 7. If toSkip is finite and toSkip > 𝔽(2**53 - 1), then
	if (toSkip !== Infinity && toSkip > Number.MAX_SAFE_INTEGER) {
		// a. Let error be ThrowCompletion(a newly created RangeError object).
		error = ThrowCompletion(new TypeError("`skippedElements` is greater than MAX_SAFE_INTEGER"));
		// b. Return ? IteratorClose(iterated, error).
		return IteratorClose(iterated, error);
	}
	// 8. Let skipped be +0𝔽.
	var skipped = 0;
	// 9. Set iterated to ? GetIteratorDirect(O).
	iterated = {
		"[[Iterator]]": O,
		"[[NextMethod]]": Get(O, "next"),
		"[[Done]]": false
	};
	// 10. Repeat,
	while (true) {
		// a. Let value be ? IteratorStepValue(iterated).
		var value = IteratorStepValue(iterated);
		// b. If value is DONE, return false.
		if (value === IteratorStepValue.DONE) {
			return false;
		}
		// c. If skipped < toSkip, then
		if (skipped < toSkip) {
			// i. Set skipped to skipped + 1𝔽.
			skipped++;
		}
		// d. Else if SameValueZero(value, searchElement) is true, then
		else if (SameValueZero(value, searchElement) === true) {
			// i. Return ? IteratorClose(iterated, NormalCompletion(true)).
			return IteratorClose(iterated, NormalCompletion(true));
		}
	}
});
