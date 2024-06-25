/* global CreateMethodProperty, GetIterator, GetSetRecord, IteratorClose, IteratorStepValue, NormalCompletion, Set */
// 24.2.4.12 Set.prototype.isSupersetOf ( other )
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
		// 5. Let keysIter be ? GetIteratorFromMethod(otherRec.[[SetObject]], otherRec.[[Keys]]).
		var keysIter = GetIterator(otherRec["[[SetObject]]"], otherRec["[[Keys]]"]);
		// 6. Let next be NOT-STARTED.
		var next;
		// 7. Repeat, while next is not DONE,
		while (next !== IteratorStepValue.DONE) {
			// a. Set next to ? IteratorStepValue(keysIter).
			next = IteratorStepValue(keysIter);
			// b. If next is not DONE, then
			if (next !== IteratorStepValue.DONE) {
				// i. If SetDataHas(O.[[SetData]], next) is false, then
				if (O.has(next) === false) {
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
