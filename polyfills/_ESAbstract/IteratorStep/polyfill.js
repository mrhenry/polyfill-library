/* global IteratorNext, IteratorComplete */
// 7.4.5. IteratorStep ( iteratorRecord )
function IteratorStep(iteratorRecord) {
	// 1. Let result be ? IteratorNext(iteratorRecord).
	var result = IteratorNext(iteratorRecord);
	var done;
	try {
		// 2. Let done be Completion(IteratorComplete(result)).
		done = IteratorComplete(result);
	} catch (err) {
		// 3. If done is a throw completion, then
		// a. Set iteratorRecord.[[Done]] to true.
		iteratorRecord["[[Done]]"] = true;
		// b. Return ? done.
		throw err;
	}
	// 4. Set done to ! done.
	// 5. If done is true, then
	if (done === true) {
		// a. Set iteratorRecord.[[Done]] to true.
		iteratorRecord["[[Done]]"] = true;
		// b. Return done.
		return IteratorStep.DONE;
	}
	// 6. Return result.
	return result;
}

// `DONE` iterator tombstone
IteratorStep.DONE = {};
