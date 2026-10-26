/* global Call, GetMethod, NormalCompletion, Promise, ThrowCompletion, Type */
// 7.4.15 AsyncIteratorClose ( iteratorRecord, completion )
// As this awaits, it returns a promise that settles with the completion.
// eslint-disable-next-line no-unused-vars
function AsyncIteratorClose(iteratorRecord, completion) {
	function complete() {
		return completion["[[Type]]"] === "throw"
			? Promise.reject(completion["[[Value]]"])
			: Promise.resolve(completion["[[Value]]"]);
	}
	// 1. Assert: iteratorRecord.[[Iterator]] is an Object.
	// 2. Let iterator be iteratorRecord.[[Iterator]].
	var iterator = iteratorRecord["[[Iterator]]"];
	var innerResult;
	try {
		// 3. Let innerResult be Completion(GetMethod(iterator, "return")).
		// 4. If innerResult is a normal completion, then
		// a. Let return be innerResult.[[Value]].
		var returnMethod = GetMethod(iterator, "return");
		// b. If return is undefined, return ? completion.
		if (returnMethod === undefined) {
			return complete();
		}
		// c. Set innerResult to Completion(Call(return, iterator)).
		// d. If innerResult is a normal completion, set innerResult to Completion(Await(innerResult.[[Value]])).
		innerResult = Promise.resolve(Call(returnMethod, iterator)).then(NormalCompletion, ThrowCompletion);
	} catch (error) {
		innerResult = Promise.resolve(ThrowCompletion(error));
	}
	return innerResult.then(function (innerResult) {
		// 5. If completion is a throw completion, return ? completion.
		if (completion["[[Type]]"] === "throw") {
			return complete();
		}
		// 6. If innerResult is a throw completion, return ? innerResult.
		if (innerResult["[[Type]]"] === "throw") {
			throw innerResult["[[Value]]"];
		}
		// 7. If innerResult.[[Value]] is not an Object, throw a TypeError exception.
		if (Type(innerResult["[[Value]]"]) !== "object") {
			throw new TypeError("Iterator's return method returned a non-object.");
		}
		// 8. Return ? completion.
		return complete();
	});
}
