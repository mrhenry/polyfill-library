/* global CanBeHeldWeakly, CreateMethodProperty, WeakMap */
// 24.3.3.4 WeakMap.prototype.getOrInsert ( key, value )
CreateMethodProperty(WeakMap.prototype, "getOrInsert", function getOrInsert(key, value) {
	// 1. Let weakMap be the this value.
	var weakMap = this;
	// 2. Perform ? RequireInternalSlot(weakMap, [[WeakMapData]]).
	WeakMap.prototype.has.call(weakMap, {});
	// 3. If CanBeHeldWeakly(key) is false, throw a TypeError exception.
	if (CanBeHeldWeakly(key) === false) {
		throw new TypeError("Invalid value used as weak map key");
	}
	// 4. For each Record { [[Key]], [[Value]] } entry of weakMap.[[WeakMapData]], do
	//   a. If entry.[[Key]] is not empty and SameValue(entry.[[Key]], key) is true, return entry.[[Value]].
	if (weakMap.has(key)) {
		return weakMap.get(key);
	}
	// 5. Let entry be the Record { [[Key]]: key, [[Value]]: value }.
	// 6. Append entry to weakMap.[[WeakMapData]].
	weakMap.set(key, value);
	// 7. Return value.
	return value;
});
