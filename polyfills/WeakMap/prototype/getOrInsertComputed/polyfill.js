/* global Call, CreateMethodProperty, IsCallable, WeakMap */

// TODO
// 4 WeakMap.prototype.getOrInsertComputed ( key, callbackfn )
CreateMethodProperty(
	WeakMap.prototype,
	"getOrInsertComputed",
	function getOrInsertComputed(key, callbackfn) {
		// 1. Let M be the this value.
		var M = this;
		// 2. Perform ? RequireInternalSlot(M, [[WeakMapData]]).
		// 3. If CanBeHeldWeakly(key) is false, throw a TypeError exception.
		// 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
		if (IsCallable(callbackfn) === false) {
			throw new TypeError("callbackfn is not callable.");
		}
		// 5. For each Record { [[Key]], [[Value]] } p of M.[[WeakMapData]], do
		// a. If p.[[Key]] is not empty and SameValue(p.[[Key]], key) is true, return p.[[Value]].
		if (WeakMap.prototype.has.call(M, key) === true) {
			return WeakMap.prototype.get.call(M, key);
		}
		// 6. Let value be ? Call(callbackfn, undefined, « key »).
		var value = Call(callbackfn, undefined, [key]);
		// 7. NOTE: The WeakMap may have been modified during execution of callbackfn.
		// 8. For each Record { [[Key]], [[Value]] } p of M.[[WeakMapData]], do
		// a. If p.[[Key]] is not empty and SameValue(p.[[Key]], key) is true, then
		if (WeakMap.prototype.has.call(M, key) === true) {
			// i. Set p.[[Value]] to value.
			WeakMap.prototype.set.call(M, key, value);
			// ii. Return value.
			return value;
		}
		// 9. Let p be the Record { [[Key]]: key, [[Value]]: value }.
		// 10. Append p to M.[[WeakMapData]].
		WeakMap.prototype.set.call(M, key, value);
		// 11. Return value.
		return value;
	}
);
