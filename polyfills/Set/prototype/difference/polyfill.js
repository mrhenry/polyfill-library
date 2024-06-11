/* global Call, CreateMethodProperty, GetIterator, GetSetRecord, IteratorStepValue, Set, ToBoolean */
// 24.2.4.5 Set.prototype.difference ( other )
CreateMethodProperty(Set.prototype, "difference", function difference(other) {
	// 1. Let O be the this value.
	var O = this;
	// 2. Perform ? RequireInternalSlot(O, [[SetData]]).
	Set.prototype.has.call(O);
	// 3. Let otherRec be ? GetSetRecord(other).
	var otherRec = GetSetRecord(other);
	// 4. Let resultSetData be a copy of O.[[SetData]].
	var result = new Set();
	O.forEach(function (value) {
		result.add(value);
	});
	// 5. If SetDataSize(O.[[SetData]]) ≤ otherRec.[[Size]], then
	if (O.size <= otherRec["[[Size]]"]) {
		// a. Let thisSize be the number of elements in O.[[SetData]].
		var thisSize = O.size;
		// b. Let index be 0.
		var index = 0;
		// c. Repeat, while index < thisSize,
		result.forEach(
			// i. Let e be resultSetData[index].
			function (e) {
				if (index < thisSize) {
					// ii. If e is not empty, then
					// 1. Let inOther be ToBoolean(? Call(otherRec.[[Has]], otherRec.[[SetObject]], « e »)).
					var inOther = ToBoolean(
						Call(otherRec["[[Has]]"], otherRec["[[SetObject]]"], [e])
					);
					// 2. If inOther is true, then
					if (inOther === true) {
						// a. Set resultSetData[index] to empty.
						result.delete(e);
					}
					// iii. Set index to index + 1.
					index = index + 1;
				}
			}
		);
	}
	// 6. Else,
	else {
		// a. Let keysIter be ? GetIteratorFromMethod(otherRec.[[SetObject]], otherRec.[[Keys]]).
		var keysIter = GetIterator(otherRec["[[SetObject]]"], otherRec["[[Keys]]"]);
		// b. Let next be NOT-STARTED.
		var next;
		// c. Repeat, while next is not DONE,
		while (next !== IteratorStepValue.DONE) {
			// i. Set next to ? IteratorStepValue(keysIter).
			next = IteratorStepValue(keysIter);
			// ii. If next is not DONE, then
			if (next !== IteratorStepValue.DONE) {
				// 1. Set next to CanonicalizeKeyedCollectionKey(next).
				// eslint-disable-next-line no-compare-neg-zero
				if (next === -0) next = 0;
				// 2. Let valueIndex be SetDataIndex(resultSetData, next).
				// 3. If valueIndex is not not-found, then
				if (result.has(next)) {
					// a. Set resultSetData[valueIndex] to empty.
					result.delete(next);
				}
			}
		}
	}
	// 7. Let result be OrdinaryObjectCreate(%Set.prototype%, « [[SetData]] »).
	// 8. Set result.[[SetData]] to resultSetData.
	// 9. Return result.
	return result;
});
