/* global Call, CreateMethodProperty, GetIterator, GetSetRecord, IteratorStep, IteratorValue, Set, ToBoolean */
// 0.0.0.0.0 Set.prototype.intersection ( other ) TODO!!!
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
						// 1. Let inOther be ToBoolean(? Call(otherRec.[[Has]], otherRec.[[Set]], « e »)).
						var inOther = ToBoolean(
							Call(otherRec["[[Has]]"], otherRec["[[Set]]"], [e])
						);
						// 2. If inOther is true, then
						if (inOther === true) {
							// a. NOTE: It is possible for earlier calls to otherRec.[[Has]] to remove and re-add an element of O.[[SetData]], which can cause the same element to be visited twice during this iteration.
							// b. Let alreadyInResult be SetDataHas(resultSetData, e).
							var alreadyInResult = result.has(e);
							// c. If alreadyInResult is false, then
							if (alreadyInResult == false) {
								// i. Append e to resultSetData.
								result.add(e);
							}
						}
						// 3. NOTE: The number of elements in O.[[SetData]] may have increased during execution of otherRec.[[Has]].
						// 4. Set thisSize to the number of elements of O.[[SetData]].
						thisSize = O.size;
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
					// 3. NOTE: Because other is an arbitrary object, it is possible for its "keys" iterator to produce the same value more than once.
					// 4. Let alreadyInResult be SetDataHas(resultSetData, nextValue).
					var alreadyInResult = result.has(nextValue);
					// 5. Let inThis be SetDataHas(O.[[SetData]], nextValue).
					var inThis = O.has(nextValue);
					// 6. If alreadyInResult is false and inThis is true, then
					if (alreadyInResult === false && inThis === true) {
						// a. Append nextValue to resultSetData.
						result.add(nextValue);
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
