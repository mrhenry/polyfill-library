/* global Call, CreateMethodProperty, IsCallable, Map */

// TODO
// 2 Map.prototype.getOrInsertComputed ( key, callbackfn )
CreateMethodProperty(
	Map.prototype,
	"getOrInsertComputed",
	function getOrInsertComputed(key, callbackfn) {
		// 1. Let M be the this value.
		var M = this;
		// 2. Perform ? RequireInternalSlot(M, [[MapData]]).
		// 3. If IsCallable(callbackfn) is false, throw a TypeError exception.
		if (IsCallable(callbackfn) === false) {
			throw new TypeError("callbackfn is not callable.");
		}
		// 4. Set key to CanonicalizeKeyedCollectionKey(key).
		// 5. For each Record { [[Key]], [[Value]] } p of M.[[MapData]], do
		// a. If p.[[Key]] is not empty and SameValue(p.[[Key]], key) is true, return p.[[Value]].
		if (Map.prototype.has.call(M, key) === true) {
			return Map.prototype.get.call(M, key);
		}
		// 6. Let value be ? Call(callbackfn, undefined, « key »).
		var value = Call(callbackfn, undefined, [key]);
		// 7. NOTE: The Map may have been modified during execution of callbackfn.
		// 8. For each Record { [[Key]], [[Value]] } p of M.[[MapData]], do
		// a. If p.[[Key]] is not empty and SameValue(p.[[Key]], key) is true, then
		if (Map.prototype.has.call(M, key) === true) {
			// i. Set p.[[Value]] to value.
			Map.prototype.set.call(M, key, value);
			// ii. Return value.
			return value;
		}
		// 9. Let p be the Record { [[Key]]: key, [[Value]]: value }.
		// 10. Append p to M.[[MapData]].
		Map.prototype.set.call(M, key, value);
		// 11. Return value.
		return value;
	}
);
