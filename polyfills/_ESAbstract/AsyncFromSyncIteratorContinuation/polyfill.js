/* global CreateIterResultObject, IteratorClose, IteratorComplete, IteratorValue, Promise, ThrowCompletion */
// 27.1.5.4 AsyncFromSyncIteratorContinuation ( result, promiseCapability, syncIteratorRecord, closeOnRejection )
// eslint-disable-next-line no-unused-vars
function AsyncFromSyncIteratorContinuation(result, promiseCapability, syncIteratorRecord, closeOnRejection) {
	// 1. NOTE: Because promiseCapability is derived from the intrinsic %Promise%, the calls to promiseCapability.[[Reject]] entailed by the use IfAbruptRejectPromise below are guaranteed not to throw.
	try {
		// 2. Let done be Completion(IteratorComplete(result)).
		// 3. IfAbruptRejectPromise(done, promiseCapability).
		var done = IteratorComplete(result);
		// 4. Let value be Completion(IteratorValue(result)).
		// 5. IfAbruptRejectPromise(value, promiseCapability).
		var value = IteratorValue(result);
		// 6. Let valueWrapper be Completion(PromiseResolve(%Promise%, value)).
		var valueWrapper;
		try {
			valueWrapper = Promise.resolve(value);
		} catch (error) {
			// 7. If valueWrapper is an abrupt completion, done is false, and closeOnRejection is true, then
			if (done === false && closeOnRejection === true) {
				// a. Set valueWrapper to Completion(IteratorClose(syncIteratorRecord, valueWrapper)).
				IteratorClose(syncIteratorRecord, ThrowCompletion(error));
			}
			// 8. IfAbruptRejectPromise(valueWrapper, promiseCapability).
			throw error;
		}
	} catch (error) {
		promiseCapability["[[Reject]]"](error);
		return promiseCapability["[[Promise]]"];
	}
	// 9. Let unwrap be a new Abstract Closure with parameters (value) that captures done and performs the following steps when called:
	// a. Return CreateIteratorResultObject(value, done).
	// 10. Let onFulfilled be CreateBuiltinFunction(unwrap, 1, "", « »).
	// 11. NOTE: onFulfilled is used when processing the "value" property of an IteratorResult object in order to wait for its value if it is a promise and re-package the result in a new "unwrapped" IteratorResult object.
	var onFulfilled = function (value) {
		return CreateIterResultObject(value, done);
	};
	// 12. If done is true or closeOnRejection is false, then
	// a. Let onRejected be undefined.
	var onRejected;
	// 13. Else,
	if (done === false && closeOnRejection === true) {
		// a. Let closeIterator be a new Abstract Closure with parameters (error) that captures syncIteratorRecord and performs the following steps when called:
		// i. Return ? IteratorClose(syncIteratorRecord, ThrowCompletion(error)).
		// b. Let onRejected be CreateBuiltinFunction(closeIterator, 1, "", « »).
		// c. NOTE: onRejected is used to close the Iterator when the "value" property of an IteratorResult object it yields is a rejected promise.
		onRejected = function (error) {
			return IteratorClose(syncIteratorRecord, ThrowCompletion(error));
		};
	}
	// 14. Perform PerformPromiseThen(valueWrapper, onFulfilled, onRejected, promiseCapability).
	valueWrapper.then(onFulfilled, onRejected).then(promiseCapability["[[Resolve]]"], promiseCapability["[[Reject]]"]);
	// 15. Return promiseCapability.[[Promise]].
	return promiseCapability["[[Promise]]"];
}
