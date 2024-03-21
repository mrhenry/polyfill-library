/* global Call, CreateMethodProperty, GetIterator, GetSetRecord, IteratorClose, IteratorStep, IteratorValue, NormalCompletion, Set, ToBoolean */
// 0.0.0.0.0 Set.prototype.isDisjointFrom ( other ) TODO!!!
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
							// 1. Let inOther be ToBoolean(? Call(otherRec.[[Has]], otherRec.[[Set]], « e »)).
							var inOther = ToBoolean(
								Call(otherRec["[[Has]]"], otherRec["[[Set]]"], [e])
							);
							// 2. If inOther is true, return false.
							if (inOther === true) {
								// throw because we can't return from here
								// it will be caught by the catch, below
								throw earlyReturn;
							}
							// 3. NOTE: The number of elements in O.[[SetData]] may have increased during execution of otherRec.[[Has]].
							// 4. Set thisSize to the number of elements of O.[[SetData]].
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
					// 2. If SetDataHas(O.[[SetData]], nextValue) is true, then
					if (O.has(nextValue) === true) {
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
