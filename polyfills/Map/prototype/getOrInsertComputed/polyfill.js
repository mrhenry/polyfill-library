/* global Call, CreateMethodProperty, IsCallable, Map */
// 24.1.3.8 Map.prototype.getOrInsertComputed ( key, callback )
CreateMethodProperty(Map.prototype, "getOrInsertComputed", function getOrInsertComputed(key, callback) {
	// 1. Let M be the this value.
	var M = this;
	// 2. Perform ? RequireInternalSlot(M, [[MapData]]).
	Map.prototype.has.call(M);
	// 3. If IsCallable(callback) is false, throw a TypeError exception.
	if (IsCallable(callback) === false) {
		throw new TypeError("callback is not callable");
	}
	// 4. Set key to CanonicalizeKeyedCollectionKey(key).
	// eslint-disable-next-line no-compare-neg-zero
	if (key === -0) key = 0;
	// 5. For each Record { [[Key]], [[Value]] } p of M.[[MapData]], do
	// a. If p.[[Key]] is not empty and SameValue(p.[[Key]], key) is true, return p.[[Value]].
	if (Map.prototype.has.call(M, key)) {
		return Map.prototype.get.call(M, key);
	}
	// 6. Let value be ? Call(callback, undefined, « key »).
	var value = Call(callback, undefined, [key]);
	// 7. NOTE: The Map may have been modified during execution of callback.
	// 8. For each Record { [[Key]], [[Value]] } p of M.[[MapData]], do
	// a. If p.[[Key]] is not empty and SameValue(p.[[Key]], key) is true, then
	// i. Set p.[[Value]] to value.
	// ii. Return value.
	// 9. Let p be the Record { [[Key]]: key, [[Value]]: value }.
	// 10. Append p to M.[[MapData]].
	Map.prototype.set.call(M, key, value);
	// 11. Return value.
	return value;
});
