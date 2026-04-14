/* global CreateMethodProperty, Get, GetIterator, GetIteratorFlattenable, GetOptionsObject, Iterator, IteratorClose, IteratorCloseAll, IteratorStepValue, IteratorZip, NormalCompletion, ThrowCompletion, Type */
// 1 Iterator.zip ( iterables [ , options ] )
CreateMethodProperty(Iterator, "zip", function zip(iterables /* , options */) {
	// 1. If iterables is not an Object, throw a TypeError exception.
	if (Type(iterables) !== "object") {
		throw new TypeError("argument must be an object");
	}
	// 2. Set options to ? GetOptionsObject(options).
	var options = GetOptionsObject(arguments[1]);
	// 3. Let mode be ? Get(options, "mode").
	var mode = Get(options, "mode");
	// 4. If mode is undefined, set mode to "shortest".
	if (mode === undefined) {
		mode = "shortest";
	}
	// 5. If mode is not one of "shortest", "longest", or "strict", throw a TypeError exception.
	if (mode !== "shortest" && mode !== "longest" && mode !== "strict") {
		throw new TypeError("mode must be one of shortest, longest, or strict");
	}
	// 6. Let paddingOption be undefined.
	var paddingOption = undefined;
	// 7. If mode is "longest", then
	if (mode === "longest") {
		// a. Set paddingOption to ? Get(options, "padding").
		paddingOption = Get(options, "padding");
		// b. If paddingOption is not undefined and paddingOption is not an Object, throw a TypeError exception.
		if (paddingOption !== undefined && Type(paddingOption) !== "object") {
			throw new TypeError("padding must be an object");
		}
	}
	// 8. Let iters be a new empty List.
	var iters = [];
	// 9. Let padding be a new empty List.
	var padding = [];
	// 10. Let inputIter be ? GetIterator(iterables, SYNC).
	var inputIter = GetIterator(iterables);
	// 11. Let next be NOT-STARTED.
	var next;
	// 12. Repeat, while next is not DONE,
	while (next !== IteratorStepValue.DONE) {
		// a. Set next to Completion(IteratorStepValue(inputIter)).
		try {
			next = IteratorStepValue(inputIter);
		}
		// b. IfAbruptCloseIterators(next, iters).
		catch (error) {
			return IteratorCloseAll(iters, ThrowCompletion(error));
		}
		// c. If next is not DONE, then
		if (next !== IteratorStepValue.DONE) {
			// i. Let iter be Completion(GetIteratorFlattenable(next, REJECT-PRIMITIVES)).
			var iter;
			try {
				iter = GetIteratorFlattenable(next, "reject-primitives");
			}
			// ii. IfAbruptCloseIterators(iter, the list-concatenation of « inputIter » and iters).
			catch (error) {
				return IteratorCloseAll([inputIter].concat(iters), ThrowCompletion(error));
			}
			// iii. Append iter to iters.
			iters.push(iter);
		}
	}
	// 13. Let iterCount be the number of elements in iters.
	var iterCount = iters.length;
	// 14. If mode is "longest", then
	if (mode === "longest") {
		// a. If paddingOption is undefined, then
		if (paddingOption === undefined) {
			// i. Perform the following steps iterCount times:
			for (var i = 0; i < iterCount; i++) {
				// 1. Append undefined to padding.
				padding.push(undefined);
			}
		}
		// b. Else,
		else {
			// i. Let paddingIter be Completion(GetIterator(paddingOption, sync)).
			var paddingIter;
			try {
				paddingIter = GetIterator(paddingOption);
			}
			// ii. IfAbruptCloseIterators(paddingIter, iters).
			catch (error) {
				return IteratorCloseAll(iters, ThrowCompletion(error));
			}
			// iii. Let usingIterator be true.
			var usingIterator = true;
			// iv. Perform the following steps iterCount times:
			for (var j = 0; j < iterCount; j++) {
				// 1. If usingIterator is true, then
				if (usingIterator === true) {
					// a. Set next to Completion(IteratorStepValue(paddingIter)).
					try {
						next = IteratorStepValue(paddingIter);
					}
					// b. IfAbruptCloseIterators(next, iters).
					catch (error) {
						return IteratorCloseAll(iters, ThrowCompletion(error));
					}
					// c. If next is DONE, then
					if (next === IteratorStepValue.DONE) {
						// i. Set usingIterator to false.
						usingIterator = false;
					}
					// d. Else,
					else {
						// i. Append next to padding.
						padding.push(next);
					}
				}
				// 2. If usingIterator is false, append undefined to padding.
				if (usingIterator === false) {
					padding.push(undefined);
				}
			}
			// v. If usingIterator is true, then
			if (usingIterator === true) {
				// 1. Let completion be Completion(IteratorClose(paddingIter, NormalCompletion(unused))).
				try {
					IteratorClose(paddingIter, NormalCompletion());
				}
				// 2. IfAbruptCloseIterators(completion, iters).
				catch (error) {
					return IteratorCloseAll(iters, ThrowCompletion(error));
				}
			}
		}
	}
	// 15. Let finishResults be a new Abstract Closure with parameters (results) that captures nothing and performs the following steps when called:
	var finishResults = function (results) {
		// a. Return CreateArrayFromList(results).
		return results;
	};
	// 16. Return IteratorZip(iters, mode, padding, finishResults).
	return IteratorZip(iters, mode, padding, finishResults);
});
