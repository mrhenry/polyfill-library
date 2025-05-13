/* global CreateMethodProperty, Map */

// TODO
// 1 Map.prototype.getOrInsert ( key, value )
CreateMethodProperty(
	Map.prototype,
	"getOrInsert",
	function getOrInsert(key, value) {
		// 1. Let M be the this value.
		var M = this;
		// 2. Perform ? RequireInternalSlot(M, [[MapData]]).
		// 3. Set key to CanonicalizeKeyedCollectionKey(key).
		// 4. For each Record { [[Key]], [[Value]] } p of M.[[MapData]], do
		// a. If p.[[Key]] is not empty and SameValue(p.[[Key]], key) is true, return p.[[Value]].
		if (Map.prototype.has.call(M, key) === true) {
			return Map.prototype.get.call(M, key);
		}
		// 5. Let p be the Record { [[Key]]: key, [[Value]]: value }.
		// 6. Append p to M.[[MapData]].
		Map.prototype.set.call(M, key, value);
		// 7. Return value.
		return value;
	}
);
