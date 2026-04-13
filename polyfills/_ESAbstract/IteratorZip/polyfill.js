/* global CreateIterResultObject, CreateMethodProperty, Iterator, IteratorCloseAll, IteratorStep, IteratorStepValue, NormalCompletion, Symbol, ThrowCompletion */

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

// 3 IteratorZip ( iters, mode, padding, finishResults )
function IteratorZip(iters, mode, padding, finishResults) { // eslint-disable-line no-unused-vars
	// 1. Let iterCount be the number of elements in iters.
	var iterCount = iters.length;
	// 2. Let openIters be a copy of iters.
	var openIters = iters.slice(0);
	// 3. Let closure be a new Abstract Closure with no parameters that captures iters, iterCount, openIters, mode, padding, and finishResults, and performs the following steps when called:
	// 4. Let gen be CreateIteratorFromClosure(closure, "Iterator Helper", %IteratorHelperPrototype%, « [[UnderlyingIterators]] »).
	var gen = Object.create(IteratorHelperPrototype);
	gen["[[Done]]"] = false;

	CreateMethodProperty(gen, "next", function () {
		// a. If iterCount = 0, return ReturnCompletion(undefined).
		if (iterCount === 0) {
			this["[[Done]]"] = true;
		}
		if (this["[[Done]]"] === true) {
			return CreateIterResultObject(undefined, true);
		}
		// b. Repeat,
		while (true) {
			// i. Let results be a new empty List.
			var results = [];
			// ii. Assert: openIters is not empty.
			// iii. For each integer i such that 0 ≤ i < iterCount, in ascending order, do
			for (var i = 0; i < iterCount; i++) {
				// 1. Let iter be iters[i].
				var iter = iters[i];
				var result;
				// 2. If iter is null, then
				if (iter === null) {
					// a. Assert: mode is "longest".
					// b. Let result be padding[i].
					result = padding[i];
				}
				// 3. Else,
				else {
					// a. Let result be Completion(IteratorStepValue(iter)).
					try {
						result = IteratorStepValue(iter);
					}
					// b. If result is an abrupt completion, then
					catch (error) {
						// i. Remove iter from openIters.
						openIters.splice(openIters.indexOf(iter), 1);
						// ii. Return ? IteratorCloseAll(openIters, result).
						this["[[Done]]"] = true;
						return IteratorCloseAll(openIters, ThrowCompletion(error));
					}
					// c. Set result to ! result.
					// d. If result is DONE, then
					if (result === IteratorStepValue.DONE) {
						// i. Remove iter from openIters.
						openIters.splice(openIters.indexOf(iter), 1);
						// ii. If mode is "shortest", then
						if (mode === "shortest") {
							// i. Return ? IteratorCloseAll(openIters, ReturnCompletion(undefined)).
							return IteratorCloseAll(openIters, NormalCompletion(CreateIterResultObject(undefined, true)));
						}
						// iii. Else if mode is "strict", then
						else if (mode === "strict") {
							// i. If i ≠ 0, then
							if (i !== 0) {
								// i. Return ? IteratorCloseAll(openIters, ThrowCompletion(a newly created TypeError object)).
								this["[[Done]]"] = true;
								return IteratorCloseAll(openIters, ThrowCompletion(new TypeError("all iterables must finish at the same time in strict mode")));
							}
							// ii. For each integer k such that 1 ≤ k < iterCount, in ascending order, do
							for (var k = 1; k < iterCount; k++) {
								// i. Assert: iters[k] is not null.
								// ii. Let open be Completion(IteratorStep(iters[k])).
								var open;
								try {
									open = IteratorStep(iters[k]);
								}
								// iii. If open is an abrupt completion, then
								catch (error) {
									// i. Remove iters[k] from openIters.
									openIters.splice(openIters.indexOf(iters[k]), 1);
									// ii. Return ? IteratorCloseAll(openIters, open).
									this["[[Done]]"] = true;
									return IteratorCloseAll(openIters, ThrowCompletion(error));
								}
								// iv. Set open to ! open.
								// v. If open is DONE, then
								if (open === IteratorStep.DONE) {
									// i. Remove iters[k] from openIters.
									openIters.splice(openIters.indexOf(iters[k]), 1);
								}
								// vi. Else,
								else {
									// i. Return ? IteratorCloseAll(openIters, ThrowCompletion(a newly created TypeError object)).
									this["[[Done]]"] = true;
									return IteratorCloseAll(openIters, ThrowCompletion(new TypeError("all iterables must finish at the same time in strict mode")));
								}
							}
							// iii. Return ReturnCompletion(undefined).
							return CreateIterResultObject(undefined, true);
						}
						// iv. Else,
						else {
							// i. Assert: mode is "longest".
							// ii. If openIters is empty, return ReturnCompletion(undefined).
							if (openIters.length === 0) {
								return CreateIterResultObject(undefined, true);
							}
							// iii. Set iters[i] to null.
							iters[i] = null;
							// iv. Set result to padding[i].
							result = padding[i];
						}
					}
				}
				// 4. Append result to results.
				results.push(result);
			}
			// iv. Set results to finishResults(results).
			// v. Let completion be Completion(Yield(results)).
			try {
				results = finishResults(results);
				return CreateIterResultObject(results, false);
			}
			// vi. If completion is an abrupt completion, then
			catch (error) {
				// 1. Return ? IteratorCloseAll(openIters, completion).
				this["[[Done]]"] = true;
				return IteratorCloseAll(openIters, ThrowCompletion(error));
			}
		}
	});

	CreateMethodProperty(gen, "return", function () {
		this["[[Done]]"] = true;
		return IteratorCloseAll(openIters, NormalCompletion(CreateIterResultObject(undefined, true)));
	});

	// 5. Set gen.[[UnderlyingIterators]] to openIters.
	// 6. Return gen.
	return gen;
}
