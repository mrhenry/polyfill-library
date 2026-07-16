/* global CreateIterResultObject, CreateMethodProperty, Get, IsInteger, Iterator, IteratorClose, IteratorStepValue, NormalCompletion, Symbol, ThrowCompletion, Type */

var IteratorHelperPrototype = (function () {
	var iterator = Object.create(Iterator.prototype);
	iterator[Symbol.iterator] = function () {
		return {
			next: function () {
				return { value: undefined, done: true };
			}
		};
	};
	// use `Iterator.prototype.take` as a way to get `IteratorHelperPrototype`
	var iteratorHelper = iterator.take(0);
	return Object.getPrototypeOf(iteratorHelper);
})();

// TODO
CreateMethodProperty(Iterator.prototype, "chunks", function chunks(chunkSize) {
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
	// 4. If chunkSize is not an integral Number, then
	if (!IsInteger(chunkSize)) {
		// a. Let error be ThrowCompletion(a newly created TypeError object).
		var error = ThrowCompletion(new TypeError("`chunkSize` is not an integer"));
		// b. Return ? IteratorClose(iterated, error).
		return IteratorClose(iterated, error);
	}
	// 5. If chunkSize is not in the inclusive interval from 1𝔽 to 𝔽(2**32 - 1), then
	if (chunkSize < 1 || chunkSize > Math.pow(2, 32) - 1) {
		// a. Let error be ThrowCompletion(a newly created RangeError object).
		error = ThrowCompletion(new RangeError("`chunkSize` is invalid"));
		// b. Return ? IteratorClose(iterated, error).
		return IteratorClose(iterated, error);
	}
	// 6. Set iterated to ? GetIteratorDirect(O).
	iterated = {
		"[[Iterator]]": O,
		"[[NextMethod]]": Get(O, "next"),
		"[[Done]]": false
	};
	// 7. Let closure be a new Abstract Closure with no parameters that captures iterated and chunkSize and performs the following steps when called:
	// 8. Let result be CreateIteratorFromClosure(closure, "Iterator Helper", %IteratorHelperPrototype%, « [[UnderlyingIterators]] »).
	var result = Object.create(IteratorHelperPrototype);
	result["[[Done]]"] = false;

	// a. Let buffer be a new empty List.
	var buffer = [];

	CreateMethodProperty(result, "next", function () {
		if (this["[[Done]]"] === true) {
			return CreateIterResultObject(undefined, true);
		}

		// b. Repeat,
		while (true) {

			// TODO shouldn't we handle errors thrown by IteratorStepValue/Yield and set this["[[Done]]"]???

			// i. Let value be ? IteratorStepValue(iterated).
			var value = IteratorStepValue(iterated);
			// ii. If value is DONE, then
			if (value === IteratorStepValue.DONE) {
				this["[[Done]]"] = true;
				// 1. If buffer is not empty, then
				if (buffer.length > 0) {
					// a. Perform Completion(Yield(CreateArrayFromList(buffer))).
					return CreateIterResultObject(buffer.slice(), true);
				}
				// 2. Return ReturnCompletion(undefined).
				return CreateIterResultObject(undefined, true);
			}
			// iii. Append value to buffer.
			buffer.push(value);
			// iv. If the number of elements in buffer is ℝ(chunkSize), then
			if (buffer.length === chunkSize) {
				// 1. Let completion be Completion(Yield(CreateArrayFromList(buffer))).
				try {
					var completion = CreateIterResultObject(buffer.slice(), true);
				}
				// 2. IfAbruptCloseIterator(completion, iterated).
				catch (err) {
					this["[[Done]]"] = true;
					return IteratorClose(iterated, ThrowCompletion(err));
				}
				// 3. Set buffer to a new empty List.
				buffer = [];
				return completion;
			}
		}
	});

	CreateMethodProperty(result, "return", function () {
		IteratorClose(iterated, NormalCompletion());
		this["[[Done]]"] = true;
		return CreateIterResultObject(undefined, true);
	});

	// 9. Set result.[[UnderlyingIterators]] to « iterated ».
	// 10. Return result.
	return result;
});
