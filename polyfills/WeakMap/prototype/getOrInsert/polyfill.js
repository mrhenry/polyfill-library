/* global CreateMethodProperty, WeakMap */

// TODO
// 3 WeakMap.prototype.getOrInsert ( key, value )
CreateMethodProperty(
	WeakMap.prototype,
	"getOrInsert",
	function getOrInsert(key, value) {
		// 1. Let M be the this value.
		var M = this;
		// 2. Perform ? RequireInternalSlot(M, [[WeakMapData]]).
		// 3. If CanBeHeldWeakly(key) is false, throw a TypeError exception.
		// 4. For each Record { [[Key]], [[Value]] } p of M.[[WeakMapData]], do
		// a. If p.[[Key]] is not empty and SameValue(p.[[Key]], key) is true, return p.[[Value]].
		if (WeakMap.prototype.has.call(M, key) === true) {
			return WeakMap.prototype.get.call(M, key);
		}
		// 5. Let p be the Record { [[Key]]: key, [[Value]]: value }.
		// 6. Append p to M.[[WeakMapData]].
		WeakMap.prototype.set.call(M, key, value);
		// 7. Return value.
		return value;
	}
);
