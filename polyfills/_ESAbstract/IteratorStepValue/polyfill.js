/* global IteratorStep, IteratorValue */
// 7.4.8 IteratorStepValue ( iteratorRecord )
// eslint-disable-next-line no-unused-vars
function IteratorStepValue(iteratorRecord) {
	// 1. Let result be ? IteratorStep(iteratorRecord).
	var result = IteratorStep(iteratorRecord);
	// 2. If result is done, then
	if (result === false) {
		// a. Return done.
		iteratorRecord["[[Done]]"] = true;
		return;
	}
	// 3. Let value be Completion(IteratorValue(result)).
	var value;
	try {
		value = IteratorValue(result);
	} catch (err) {
		// 4. If value is a throw completion, then
		// a. Set iteratorRecord.[[Done]] to true.
		iteratorRecord["[[Done]]"] = true;
		throw err;
	}
	// 5. Return ? value.
	return value;
}
