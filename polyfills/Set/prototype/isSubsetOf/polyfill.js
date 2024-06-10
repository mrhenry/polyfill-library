/* global Call, CreateMethodProperty, GetSetRecord, Set, ToBoolean */
// 24.2.4.11 Set.prototype.isSubsetOf ( other )
CreateMethodProperty(Set.prototype, "isSubsetOf", function isSubsetOf(other) {
	// 1. Let O be the this value.
	var O = this;
	// 2. Perform ? RequireInternalSlot(O, [[SetData]]).
	Set.prototype.has.call(O);
	// 3. Let otherRec be ? GetSetRecord(other).
	var otherRec = GetSetRecord(other);
	// 4. If SetDataSize(O.[[SetData]]) > otherRec.[[Size]], return false.
	if (O.size > otherRec["[[Size]]"]) {
		return false;
	}
	// 5. Let thisSize be the number of elements in O.[[SetData]].
	var thisSize = O.size;
	// 6. Let index be 0.
	var index = 0;
	var earlyReturn = {};
	try {
		// 7. Repeat, while index < thisSize,
		O.forEach(
			// a. Let e be O.[[SetData]][index].
			function (e) {
				if (index < thisSize) {
					// b. Set index to index + 1.
					index = index + 1;
					// c. If e is not empty, then
					// i. Let inOther be ToBoolean(? Call(otherRec.[[Has]], otherRec.[[SetObject]], « e »)).
					var inOther = ToBoolean(
						Call(otherRec["[[Has]]"], otherRec["[[SetObject]]"], [e])
					);
					// ii. If inOther is false, return false.
					if (inOther === false) {
						// throw because we can't return from here
						// it will be caught by the catch, below
						throw earlyReturn;
					}
					// iii. NOTE: The number of elements in O.[[SetData]] may have increased during execution of otherRec.[[Has]].
					// iv. Set thisSize to the number of elements in O.[[SetData]].
					thisSize = O.size;
				}
			}
		);
	} catch (e) {
		// handle special `throw earlyReturn` case, above
		if (e === earlyReturn) return false;
		throw e;
	}
	// 8. Return true.
	return true;
});
