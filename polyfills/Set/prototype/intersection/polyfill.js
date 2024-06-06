/* global Call, CreateMethodProperty, GetIterator, GetSetRecord, IteratorStepValue, Set, ToBoolean */
// 24.2.4.9 Set.prototype.intersection ( other )
CreateMethodProperty(
	Set.prototype,
	"intersection",
	function intersection(other) {
		// 1. Let O be the this value.
		var O = this;
		// 2. Perform ? RequireInternalSlot(O, [[SetData]]).
		Set.prototype.has.call(O);
		// 3. Let otherRec be ? GetSetRecord(other).
		var otherRec = GetSetRecord(other);
		// 4. Let resultSetData be a new empty List.
		var result = new Set();
		// 5. If SetDataSize(O.[[SetData]]) ≤ otherRec.[[Size]], then
		if (O.size <= otherRec["[[Size]]"]) {
			// a. Let thisSize be the number of elements in O.[[SetData]].
			var thisSize = O.size;
			// b. Let index be 0.
			var index = 0;
			// c. Repeat, while index < thisSize,
			O.forEach(
				// i. Let e be O.[[SetData]][index].
				function (e) {
					if (index < thisSize) {
						// ii. Set index to index + 1.
						index = index + 1;
						// iii. If e is not empty, then
						// 1. Let inOther be ToBoolean(? Call(otherRec.[[Has]], otherRec.[[SetObject]], « e »)).
						var inOther = ToBoolean(
							Call(otherRec["[[Has]]"], otherRec["[[SetObject]]"], [e])
						);
						// 2. If inOther is true, then
						if (inOther === true) {
							// a. NOTE: It is possible for earlier calls to otherRec.[[Has]] to remove and re-add an element of O.[[SetData]], which can cause the same element to be visited twice during this iteration.
							// b. If SetDataHas(resultSetData, e) is false, then
							if (result.has(e) === false) {
								// i. Append e to resultSetData.
								result.add(e);
							}
						}
						// 3. NOTE: The number of elements in O.[[SetData]] may have increased during execution of otherRec.[[Has]].
						// 4. Set thisSize to the number of elements in O.[[SetData]].
						thisSize = O.size;
					}
				}
			);
		}
		// 6. Else,
		else {
			// a. Let keysIter be ? GetIteratorFromMethod(otherRec.[[SetObject]], otherRec.[[Keys]]).
			var keysIter = GetIterator(
				otherRec["[[SetObject]]"],
				otherRec["[[Keys]]"]
			);
			// b. Let next be not-started.
			var next;
			// c. Repeat, while next is not done,
			while (!keysIter["[[Done]]"]) {
				// i. Set next to ? IteratorStepValue(keysIter).
				next = IteratorStepValue(keysIter);
				// ii. If next is not done, then
				if (!keysIter["[[Done]]"]) {
					// 1. Set next to CanonicalizeKeyedCollectionKey(next).
					// eslint-disable-next-line no-compare-neg-zero
					if (next === -0) next = 0;
					// 2. Let inThis be SetDataHas(O.[[SetData]], next).
					var inThis = O.has(next);
					// 3. If inThis is true, then
					if (inThis === true) {
						// a. NOTE: Because other is an arbitrary object, it is possible for its "keys" iterator to produce the same value more than once.
						// b. If SetDataHas(resultSetData, next) is false, then
						if (result.has(next) === false) {
							// i. Append next to resultSetData.
							result.add(next);
						}
					}
				}
			}
		}
		// 7. Let result be OrdinaryObjectCreate(%Set.prototype%, « [[SetData]] »).
		// 8. Set result.[[SetData]] to resultSetData.
		// 9. Return result.
		return result;
	}
);
