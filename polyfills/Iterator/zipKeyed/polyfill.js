/* global CreateDataPropertyOrThrow, CreateMethodProperty, Get, GetIteratorFlattenable, GetOptionsObject, Iterator, IteratorCloseAll, IteratorZip, Reflect, ThrowCompletion, Type */
// 2 Iterator.zipKeyed ( iterables [ , options ] )
CreateMethodProperty(Iterator, "zipKeyed", function zipKeyed(iterables /* , options */) {
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
	// 10. Let allKeys be ? iterables.[[OwnPropertyKeys]]().
	var allKeys = Reflect.ownKeys(iterables);
	// 11. Let keys be a new empty List.
	var keys = [];
	// 12. For each element key of allKeys, do
	for (var j = 0; j < allKeys.length; j++) {
		var key = allKeys[j];
		// a. Let desc be Completion(iterables.[[GetOwnProperty]](key)).
		var desc;
		try {
			desc = Reflect.getOwnPropertyDescriptor(iterables, key);
		} catch (error) {
			// b. IfAbruptCloseIterators(desc, iters).
			return IteratorCloseAll(iters, ThrowCompletion(error));
		}
		// c. If desc is not undefined and desc.[[Enumerable]] is true, then
		if (desc !== undefined && desc.enumerable === true) {
			// i. Let value be Completion(Get(iterables, key)).
			var value;
			try {
				value = Get(iterables, key);
			} catch (error) {
				// ii. IfAbruptCloseIterators(value, iters).
				return IteratorCloseAll(iters, ThrowCompletion(error));
			}
			// iii. If value is not undefined, then
			if (value !== undefined) {
				// 1. Append key to keys.
				keys.push(key);
				// 2. Let iter be Completion(GetIteratorFlattenable(value, REJECT-PRIMITIVES)).
				var iter;
				try {
					iter = GetIteratorFlattenable(value, "reject-primitives");
				} catch (error) {
					// 3. IfAbruptCloseIterators(iter, iters).
					return IteratorCloseAll(iters, ThrowCompletion(error));
				}
				// 4. Append iter to iters.
				iters.push(iter);
			}
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
			// i. For each element key of keys, do
			for (var k = 0; k < keys.length; k++) {
				key = keys[k];
				// 1. Let value be Completion(Get(paddingOption, key)).
				value;
				try {
					value = Get(paddingOption, key);
				} catch (error) {
					// 2. IfAbruptCloseIterators(value, iters).
					return IteratorCloseAll(iters, ThrowCompletion(error));
				}
				// 3. Append value to padding.
				padding.push(value);
			}
		}
	}
	// 15. Let finishResults be a new Abstract Closure with parameters (results) that captures keys and iterCount and performs the following steps when called:
	var finishResults = function (results) {
		// a. Let obj be OrdinaryObjectCreate(null).
		var obj = Object.create(null);
		// b. For each integer i such that 0 ≤ i < iterCount, in ascending order, do
		for (var i = 0; i < iterCount; i++) {
			// i. Perform ! CreateDataPropertyOrThrow(obj, keys[i], results[i]).
			CreateDataPropertyOrThrow(obj, keys[i], results[i]);
		}
		// c. Return obj.
		return obj;
	};
	// 16. Return IteratorZip(iters, mode, padding, finishResults).
	return IteratorZip(iters, mode, padding, finishResults);
});
