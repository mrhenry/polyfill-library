/* global CreateMethodProperty, GetSetRecord, IteratorStep, IteratorValue, Set */
// 0.0.0.0.0 Set.prototype.symmetricDifference ( other ) TODO!!!
CreateMethodProperty(
	Set.prototype,
	"symmetricDifference",
	function symmetricDifference(other) {
		// 1. Let O be the this value.
		var O = this;
		// 2. Perform ? RequireInternalSlot(O, [[SetData]]).
		Set.prototype.has.call(O);
		// 3. Let otherRec be ? GetSetRecord(other).
		var otherRec = GetSetRecord(other);
		// 4. Let keysIter be ? GetIteratorFromMethod(otherRec.[[Set]], otherRec.[[Keys]]).
		var keysIter = GetIterator(otherRec["[[Set]]"], otherRec["[[Keys]]"]);
		// 5. Let resultSetData be a copy of O.[[SetData]].
		var result = new Set();
		O.forEach(function (value) {
			result.add(value);
		});
		// 6. Let next be true.
		var next = true;
		// 7. Repeat, while next is not false,
		while (next !== false) {
			// a. Set next to ? IteratorStep(keysIter).
			var next = IteratorStep(keysIter);
			// b. If next is not false, then
			if (next !== false) {
				// i. Let nextValue be ? IteratorValue(next).
				var nextValue = IteratorValue(next);
				// ii. If nextValue is -0𝔽, set nextValue to +0𝔽.
				// eslint-disable-next-line no-compare-neg-zero
				if (nextValue === -0) nextValue = 0;
				// iii. Let inResult be SetDataHas(resultSetData, nextValue).
				var inResult = result.has(nextValue);
				// iv. If SetDataHas(O.[[SetData]], nextValue) is true, then
				if (O.has(nextValue) === true) {
					// 1. If inResult is true, remove nextValue from resultSetData.
					if (inResult === true) {
						result.delete(nextValue);
					}
				}
				// v. Else,
				else {
					// 1. If inResult is false, append nextValue to resultSetData.
					if (inResult === false) {
						result.add(nextValue);
					}
				}
			}
		}
		// 8. Let result be OrdinaryObjectCreate(%Set.prototype%, « [[SetData]] »).
		// 9. Set result.[[SetData]] to resultSetData.
		// 10. Return result.
		return result;
	}
);
