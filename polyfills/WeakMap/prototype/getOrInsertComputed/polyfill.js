/* global Call, CanBeHeldWeakly, CreateMethodProperty, IsCallable, WeakMap */
// 24.3.3.5 WeakMap.prototype.getOrInsertComputed ( key, callback )
CreateMethodProperty(WeakMap.prototype, "getOrInsertComputed", function getOrInsertComputed(key, callback) {
	// 1. Let weakMap be the this value.
	var weakMap = this;
	// 2. Perform ? RequireInternalSlot(weakMap, [[WeakMapData]]).
	WeakMap.prototype.has.call(weakMap, {});
	// 3. If CanBeHeldWeakly(key) is false, throw a TypeError exception.
	if (CanBeHeldWeakly(key) === false) {
		throw new TypeError("Invalid value used as weak map key");
	}
	// 4. If IsCallable(callback) is false, throw a TypeError exception.
	if (IsCallable(callback) === false) {
		throw new TypeError("Method WeakMap.prototype.getOrInsertComputed called with a callback that is not callable");
	}
	// 5. For each Record { [[Key]], [[Value]] } entry of weakMap.[[WeakMapData]], do
	//   a. If entry.[[Key]] is not empty and SameValue(entry.[[Key]], key) is true, return entry.[[Value]].
	if (weakMap.has(key)) {
		return weakMap.get(key);
	}
	// 6. Let value be ? Call(callback, undefined, « key »).
	var value = Call(callback, undefined, [key]);
	// 7. NOTE: The WeakMap may have been modified during execution of callback.
	// 8. For each Record { [[Key]], [[Value]] } entry of weakMap.[[WeakMapData]], do
	//   a. If entry.[[Key]] is not empty and SameValue(entry.[[Key]], key) is true, then
	//     i. Set entry.[[Value]] to value.
	//     ii. Return value.
	// 9. Let entry be the Record { [[Key]]: key, [[Value]]: value }.
	// 10. Append entry to weakMap.[[WeakMapData]].
	// `set` does both: it updates an entry that the callback added, or else adds one.
	weakMap.set(key, value);
	// 11. Return value.
	return value;
});
