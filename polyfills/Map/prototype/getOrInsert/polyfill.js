/* global CreateMethodProperty, Map */
// 24.1.3.7 Map.prototype.getOrInsert ( key, value )
CreateMethodProperty(Map.prototype, "getOrInsert", function getOrInsert(key, value) {
	// 1. Let map be the this value.
	var map = this;
	// 2. Perform ? RequireInternalSlot(map, [[MapData]]).
	Map.prototype.has.call(map);
	// 3. Set key to CanonicalizeKeyedCollectionKey(key).
	// eslint-disable-next-line no-compare-neg-zero
	if (key === -0) key = 0;
	// 4. For each Record { [[Key]], [[Value]] } entry of map.[[MapData]], do
	//   a. If entry.[[Key]] is not empty and SameValue(entry.[[Key]], key) is true, return entry.[[Value]].
	if (map.has(key)) {
		return map.get(key);
	}
	// 5. Let entry be the Record { [[Key]]: key, [[Value]]: value }.
	// 6. Append entry to map.[[MapData]].
	map.set(key, value);
	// 7. Return value.
	return value;
});
