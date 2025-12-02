/* global CreateMethodProperty, GetIterator, IteratorClose, IteratorStepValue, RequireObjectCoercible, ThrowCompletion */
// 21.3.2.34 Math.sumPrecise ( items )
CreateMethodProperty(Math, "sumPrecise", function sumPrecise(items) {
	// 1. Perform ? RequireObjectCoercible(items).
	RequireObjectCoercible(items);
	// 2. Let iteratorRecord be ? GetIterator(items, sync).
	var iteratorRecord = GetIterator(items);
	// 3. Let state be minus-zero.
	var state = "MINUS-ZERO";
	// 4. Let sum be 0.
	var sum = 0;
	// 5. Let count be 0.
	var count = 0;
	// 6. Let next be not-started.
	var next;
	// 7. Repeat, while next is not done,
	while (next !== IteratorStepValue.DONE) {
		// a. Set next to ? IteratorStepValue(iteratorRecord).
		next = IteratorStepValue(iteratorRecord);
		// b. If next is not done, then
		if (next !== IteratorStepValue.DONE) {
			// i. If count ≥ 2**53 - 1, then
			if (count >= Number.MAX_SAFE_INTEGER) {
				// 1. NOTE: This step is not expected to be reached in practice and is included only so that implementations may rely on inputs being "reasonably sized" without violating this specification.
				// 2. Let error be ThrowCompletion(a newly created RangeError object).
				var error = ThrowCompletion(new RangeError("count greater than or equal to MAX_SAFE_INTEGER"));
				// 3. Return ? IteratorClose(iteratorRecord, error).
				return IteratorClose(iteratorRecord, error);
			}
			// ii. If next is not a Number, then
			if (typeof next !== "number") {
				// 1. Let error be ThrowCompletion(a newly created TypeError object).
				error = ThrowCompletion(new TypeError("value is not a number"));
				// 2. Return ? IteratorClose(iteratorRecord, error).
				return IteratorClose(iteratorRecord, error);
			}
			// iii. Let n be next.
			var n = next;
			// iv. If state is not not-a-number, then
			if (state !== "NOT-A-NUMBER") {
				// 1. If n is NaN, then
				if (isNaN(n)) {
					// a. Set state to not-a-number.
					state = "NOT-A-NUMBER";
				}
				// 2. Else if n is +∞𝔽, then
				else if (n === Infinity) {
					// a. If state is minus-infinity, set state to not-a-number.
					if (state === "MINUS-INFINITY") {
						state = "NOT-A-NUMBER";
					}
					// b. Else, set state to plus-infinity.
					else {
						state = "PLUS-INFINITY";
					}
				}
				// 3. Else if n is -∞𝔽, then
				else if (n === -Infinity) {
					// a. If state is plus-infinity, set state to not-a-number.
					if (state === "PLUS-INFINITY") {
						state = "NOT-A-NUMBER";
					}
					// b. Else, set state to minus-infinity.
					else {
						state = "MINUS-INFINITY";
					}
				}
				// 4. Else if n is not -0𝔽 and state is either minus-zero or finite, then
				// eslint-disable-next-line no-compare-neg-zero
				else if (n !== -0 && (state === "MINUS-ZERO" || state === "FINITE")) {
					// a. Set state to finite.
					state = "FINITE";
					// b. Set sum to sum + ℝ(n).
					sum = computeSum([sum, n]);
				}
			}
			// v. Set count to count + 1.
			count = count + 1;
		}
	}
	// 8. If state is not-a-number, return NaN.
	if (state === "NOT-A-NUMBER") {
		return NaN;
	}
	// 9. If state is plus-infinity, return +∞𝔽.
	if (state === "PLUS-INFINITY") {
		return Infinity;
	}
	// 10. If state is minus-infinity, return -∞𝔽.
	if (state === "MINUS-INFINITY") {
		return -Infinity;
	}
	// 11. If state is minus-zero, return -0𝔽.
	if (state === "MINUS-ZERO") {
		return -0;
	}
	// 12. Return 𝔽(sum).
	return sum;
});

var computeSum = (function () {
	// NOTE: This will be replaced by an implementation in `update.task.js`
})();
