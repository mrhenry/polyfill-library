/* global Call, CreateMethodProperty, GetIterator, GetSetRecord, IteratorStep, IteratorValue, Set, ToBoolean */
// 0.0.0.0.0 Set.prototype.difference ( other ) TODO!!!
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
					// 1. Let inOther be ToBoolean(? Call(otherRec.[[Has]], otherRec.[[Set]], « e »)).
					var inOther = ToBoolean(
						Call(otherRec["[[Has]]"], otherRec["[[Set]]"], [e])
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
		// a. Let keysIter be ? GetIteratorFromMethod(otherRec.[[Set]], otherRec.[[Keys]]).
		var keysIter = GetIterator(otherRec["[[Set]]"], otherRec["[[Keys]]"]);
		// b. Let next be true.
		var next = true;
		// c. Repeat, while next is not false,
		while (next !== false) {
			// i. Set next to ? IteratorStep(keysIter).
			next = IteratorStep(keysIter);
			// ii. If next is not false, then
			if (next !== false) {
				// 1. Let nextValue be ? IteratorValue(next).
				var nextValue = IteratorValue(next);
				// 2. If nextValue is -0𝔽, set nextValue to +0𝔽.
				// eslint-disable-next-line no-compare-neg-zero
				if (nextValue === -0) nextValue = 0;
				// 3. If SetDataHas(resultSetData, nextValue) is true, then
				if (result.has(nextValue) === true) {
					// a. Remove nextValue from resultSetData.
					result.delete(nextValue);
				}
			}
		}
	}
	// 7. Let result be OrdinaryObjectCreate(%Set.prototype%, « [[SetData]] »).
	// 8. Set result.[[SetData]] to resultSetData.
	// 9. Return result.
	return result;
});
