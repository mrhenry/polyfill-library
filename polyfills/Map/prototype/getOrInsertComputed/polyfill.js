/* global Call, CreateMethodProperty, IsCallable, Map */
// 24.1.3.8 Map.prototype.getOrInsertComputed ( key, callback )
CreateMethodProperty(Map.prototype, "getOrInsertComputed", function getOrInsertComputed(key, callback) {
	// 1. Let map be the this value.
	var map = this;
	// 2. Perform ? RequireInternalSlot(map, [[MapData]]).
	Map.prototype.has.call(map);
	// 3. If IsCallable(callback) is false, throw a TypeError exception.
	if (IsCallable(callback) === false) {
		throw new TypeError("Method Map.prototype.getOrInsertComputed called with a callback that is not callable");
	}
	// 4. Set key to CanonicalizeKeyedCollectionKey(key).
	// eslint-disable-next-line no-compare-neg-zero
	if (key === -0) key = 0;
	// 5. For each Record { [[Key]], [[Value]] } entry of map.[[MapData]], do
	//   a. If entry.[[Key]] is not empty and SameValue(entry.[[Key]], key) is true, return entry.[[Value]].
	if (map.has(key)) {
		return map.get(key);
	}
	// 6. Let value be ? Call(callback, undefined, « key »).
	var value = Call(callback, undefined, [key]);
	// 7. NOTE: The Map may have been modified during execution of callback.
	// 8. For each Record { [[Key]], [[Value]] } entry of map.[[MapData]], do
	//   a. If entry.[[Key]] is not empty and SameValue(entry.[[Key]], key) is true, then
	//     i. Set entry.[[Value]] to value.
	//     ii. Return value.
	// 9. Let entry be the Record { [[Key]]: key, [[Value]]: value }.
	// 10. Append entry to map.[[MapData]].
	// `set` does both: it updates an entry that the callback added in place, or else appends one.
	map.set(key, value);
	// 11. Return value.
	return value;
});
