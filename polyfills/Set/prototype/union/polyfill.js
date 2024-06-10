/* global CreateMethodProperty, GetIterator, GetSetRecord, IteratorStepValue, Set */
// 24.2.4.16 Set.prototype.union ( other )
CreateMethodProperty(Set.prototype, "union", function union(other) {
	// 1. Let O be the this value.
	var O = this;
	// 2. Perform ? RequireInternalSlot(O, [[SetData]]).
	Set.prototype.has.call(O);
	// 3. Let otherRec be ? GetSetRecord(other).
	var otherRec = GetSetRecord(other);
	// 4. Let keysIter be ? GetIteratorFromMethod(otherRec.[[SetObject]], otherRec.[[Keys]]).
	var keysIter = GetIterator(otherRec["[[SetObject]]"], otherRec["[[Keys]]"]);
	// 5. Let resultSetData be a copy of O.[[SetData]].
	var result = new Set();
	O.forEach(function (value) {
		result.add(value);
	});
	// 6. Let next be not-started.
	var next;
	// 7. Repeat, while next is not done,
	while (!keysIter["[[Done]]"]) {
		// a. Set next to ? IteratorStepValue(keysIter).
		next = IteratorStepValue(keysIter);
		// b. If next is not done, then
		if (!keysIter["[[Done]]"]) {
			// i. Set next to CanonicalizeKeyedCollectionKey(next).
			// eslint-disable-next-line no-compare-neg-zero
			if (next === -0) next = 0;
			// ii. If SetDataHas(resultSetData, next) is false, then
			if (result.has(next) === false) {
				// 1. Append next to resultSetData.
				result.add(next);
			}
		}
	}
	// 8. Let result be OrdinaryObjectCreate(%Set.prototype%, « [[SetData]] »).
	// 9. Set result.[[SetData]] to resultSetData.
	// 10. Return result.
	return result;
});
