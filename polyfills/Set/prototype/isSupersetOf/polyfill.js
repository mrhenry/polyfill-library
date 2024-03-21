/* global CreateMethodProperty, GetIterator, GetSetRecord, IteratorClose, IteratorStep, IteratorValue, NormalCompletion, Set */
// 0.0.0.0.0 Set.prototype.isSupersetOf ( other ) TODO!!!
CreateMethodProperty(
	Set.prototype,
	"isSupersetOf",
	function isSupersetOf(other) {
		// 1. Let O be the this value.
		var O = this;
		// 2. Perform ? RequireInternalSlot(O, [[SetData]]).
		Set.prototype.has.call(O);
		// 3. Let otherRec be ? GetSetRecord(other).
		var otherRec = GetSetRecord(other);
		// 4. If SetDataSize(O.[[SetData]]) < otherRec.[[Size]], return false.
		if (O.size < otherRec["[[Size]]"]) {
			return false;
		}
		// 5. Let keysIter be ? GetIteratorFromMethod(otherRec.[[Set]], otherRec.[[Keys]]).
		var keysIter = GetIterator(otherRec["[[Set]]"], otherRec["[[Keys]]"]);
		// 6. Let next be true.
		var next = true;
		// 7. Repeat, while next is not false,
		while (next !== false) {
			// a. Set next to ? IteratorStep(keysIter).
			next = IteratorStep(keysIter);
			// b. If next is not false, then
			if (next !== false) {
				// i. Let nextValue be ? IteratorValue(next).
				var nextValue = IteratorValue(next);
				// ii. If SetDataHas(O.[[SetData]], nextValue) is false, then
				if (O.has(nextValue) === false) {
					// 1. Perform ? IteratorClose(keysIter, NormalCompletion(unused)).
					IteratorClose(keysIter, NormalCompletion(undefined));
					// 2. Return false.
					return false;
				}
			}
		}
		// 8. Return true.
		return true;
	}
);
