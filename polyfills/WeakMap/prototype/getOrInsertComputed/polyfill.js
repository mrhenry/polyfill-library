/* global Call, CanBeHeldWeakly, CreateMethodProperty, IsCallable, WeakMap */
// 24.3.3.5 WeakMap.prototype.getOrInsertComputed ( key, callback )
CreateMethodProperty(WeakMap.prototype, "getOrInsertComputed", function getOrInsertComputed(key, callback) {
	// 1. Let M be the this value.
	var M = this;
	// 2. Perform ? RequireInternalSlot(M, [[WeakMapData]]).
	WeakMap.prototype.has.call(M);
	// 3. If CanBeHeldWeakly(key) is false, throw a TypeError exception.
	if (CanBeHeldWeakly(key) === false) {
		throw new TypeError("key cannot be held weakly");
	}
	// 4. If IsCallable(callback) is false, throw a TypeError exception.
	if (IsCallable(callback) === false) {
		throw new TypeError("callback is not callable");
	}
	// 5. For each Record { [[Key]], [[Value]] } p of M.[[WeakMapData]], do
	// a. If p.[[Key]] is not empty and SameValue(p.[[Key]], key) is true, return p.[[Value]].
	if (WeakMap.prototype.has.call(M, key)) {
		return WeakMap.prototype.get.call(M, key);
	}
	// 6. Let value be ? Call(callback, undefined, « key »).
	var value = Call(callback, undefined, [key]);
	// 7. NOTE: The WeakMap may have been modified during execution of callback.
	// 8. For each Record { [[Key]], [[Value]] } p of M.[[WeakMapData]], do
	// a. If p.[[Key]] is not empty and SameValue(p.[[Key]], key) is true, then
	// i. Set p.[[Value]] to value.
	// ii. Return value.
	// 9. Let p be the Record { [[Key]]: key, [[Value]]: value }.
	// 10. Append p to M.[[WeakMapData]].
	WeakMap.prototype.set.call(M, key, value);
	// 11. Return value.
	return value;
});
