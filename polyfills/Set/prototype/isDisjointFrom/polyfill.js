/* global Call, CreateMethodProperty, GetIterator, GetSetRecord, IteratorClose, IteratorStepValue, NormalCompletion, Set, ToBoolean */
// 24.2.4.10 Set.prototype.isDisjointFrom ( other )
CreateMethodProperty(
	Set.prototype,
	"isDisjointFrom",
	function isDisjointFrom(other) {
		// 1. Let O be the this value.
		var O = this;
		// 2. Perform ? RequireInternalSlot(O, [[SetData]]).
		Set.prototype.has.call(O);
		// 3. Let otherRec be ? GetSetRecord(other).
		var otherRec = GetSetRecord(other);
		// 4. If SetDataSize(O.[[SetData]]) ≤ otherRec.[[Size]], then
		if (O.size <= otherRec["[[Size]]"]) {
			// a. Let thisSize be the number of elements in O.[[SetData]].
			var thisSize = O.size;
			// b. Let index be 0.
			var index = 0;
			var earlyReturn = {};
			try {
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
							// 2. If inOther is true, return false.
							if (inOther === true) {
								// throw because we can't return from here
								// it will be caught by the catch, below
								throw earlyReturn;
							}
							// 3. NOTE: The number of elements in O.[[SetData]] may have increased during execution of otherRec.[[Has]].
							// 4. Set thisSize to the number of elements in O.[[SetData]].
							thisSize = O.size;
						}
					}
				);
			} catch (e) {
				// handle special `throw earlyReturn` case, above
				if (e === earlyReturn) return false;
				throw e;
			}
		}
		// 5. Else,
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
					// 1. If SetDataHas(O.[[SetData]], next) is true, then
					if (O.has(next) === true) {
						// a. Perform ? IteratorClose(keysIter, NormalCompletion(unused)).
						IteratorClose(keysIter, NormalCompletion(undefined));
						// b. Return false.
						return false;
					}
				}
			}
		}
		// 6. Return true.
		return true;
	}
);
