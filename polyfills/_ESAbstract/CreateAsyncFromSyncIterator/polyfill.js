/* global AsyncFromSyncIteratorContinuation, Call, CreateIterResultObject, GetMethod, IteratorNext, NewPromiseCapability, Promise, Type */
// 27.1.5.1 CreateAsyncFromSyncIterator ( syncIteratorRecord )
// eslint-disable-next-line no-unused-vars
function CreateAsyncFromSyncIterator(syncIteratorRecord) {
	// 1. Let asyncIterator be OrdinaryObjectCreate(%AsyncFromSyncIteratorPrototype%, « [[SyncIteratorRecord]] »).
	// 2. Set asyncIterator.[[SyncIteratorRecord]] to syncIteratorRecord.
	// The methods of %AsyncFromSyncIteratorPrototype% capture syncIteratorRecord instead of reading the internal slot.
	var asyncIterator = {
		// 27.1.5.2.1 %AsyncFromSyncIteratorPrototype%.next ( [ value ] )
		next: function next(/* [ value ] */) {
			// 1. Let obj be the this value.
			// 2. Assert: obj is an Object that has a [[SyncIteratorRecord]] internal slot.
			// 3. Let promiseCapability be ! NewPromiseCapability(%Promise%).
			var promiseCapability = NewPromiseCapability(Promise);
			// 4. Let syncIteratorRecord be obj.[[SyncIteratorRecord]].
			var result;
			try {
				// 5. If value is present, then
				if (arguments.length > 0) {
					// a. Let result be Completion(IteratorNext(syncIteratorRecord, value)).
					result = IteratorNext(syncIteratorRecord, arguments[0]);
				// 6. Else,
				} else {
					// a. Let result be Completion(IteratorNext(syncIteratorRecord)).
					result = IteratorNext(syncIteratorRecord);
				}
			} catch (error) {
				// 7. IfAbruptRejectPromise(result, promiseCapability).
				promiseCapability["[[Reject]]"](error);
				return promiseCapability["[[Promise]]"];
			}
			// 8. Return AsyncFromSyncIteratorContinuation(result, promiseCapability, syncIteratorRecord, true).
			return AsyncFromSyncIteratorContinuation(result, promiseCapability, syncIteratorRecord, true);
		},

		// 27.1.5.2.2 %AsyncFromSyncIteratorPrototype%.return ( [ value ] )
		"return": function (/* [ value ] */) {
			// 1. Let obj be the this value.
			// 2. Assert: obj is an Object that has a [[SyncIteratorRecord]] internal slot.
			// 3. Let promiseCapability be ! NewPromiseCapability(%Promise%).
			var promiseCapability = NewPromiseCapability(Promise);
			// 4. Let syncIteratorRecord be obj.[[SyncIteratorRecord]].
			// 5. Let syncIterator be syncIteratorRecord.[[Iterator]].
			var syncIterator = syncIteratorRecord["[[Iterator]]"];
			var result;
			try {
				// 6. Let return be Completion(GetMethod(syncIterator, "return")).
				// 7. IfAbruptRejectPromise(return, promiseCapability).
				var returnMethod = GetMethod(syncIterator, "return");
				// 8. If return is undefined, then
				if (returnMethod === undefined) {
					// a. Let iteratorResult be CreateIteratorResultObject(value, true).
					// b. Perform ! Call(promiseCapability.[[Resolve]], undefined, « iteratorResult »).
					promiseCapability["[[Resolve]]"](CreateIterResultObject(arguments[0], true));
					// c. Return promiseCapability.[[Promise]].
					return promiseCapability["[[Promise]]"];
				}
				// 9. If value is present, then
				if (arguments.length > 0) {
					// a. Let result be Completion(Call(return, syncIterator, « value »)).
					result = Call(returnMethod, syncIterator, [arguments[0]]);
				// 10. Else,
				} else {
					// a. Let result be Completion(Call(return, syncIterator)).
					result = Call(returnMethod, syncIterator);
				}
				// 11. IfAbruptRejectPromise(result, promiseCapability).
			} catch (error) {
				promiseCapability["[[Reject]]"](error);
				return promiseCapability["[[Promise]]"];
			}
			// 12. If result is not an Object, then
			if (Type(result) !== "object") {
				// a. Perform ! Call(promiseCapability.[[Reject]], undefined, « a newly created TypeError object »).
				promiseCapability["[[Reject]]"](new TypeError("Iterator's return method returned a non-object."));
				// b. Return promiseCapability.[[Promise]].
				return promiseCapability["[[Promise]]"];
			}
			// 13. Return AsyncFromSyncIteratorContinuation(result, promiseCapability, syncIteratorRecord, false).
			return AsyncFromSyncIteratorContinuation(result, promiseCapability, syncIteratorRecord, false);
		}
	};
	// 3. Let nextMethod be ! Get(asyncIterator, "next").
	var nextMethod = asyncIterator.next;
	// 4. Let iteratorRecord be the Iterator Record { [[Iterator]]: asyncIterator, [[NextMethod]]: nextMethod, [[Done]]: false }.
	var iteratorRecord = Object.create(null);
	iteratorRecord["[[Iterator]]"] = asyncIterator;
	iteratorRecord["[[NextMethod]]"] = nextMethod;
	iteratorRecord["[[Done]]"] = false;
	// 5. Return iteratorRecord.
	return iteratorRecord;
}
