
// NOTE: This polyfill is auto-generated; modifications should be made in `polyfill.base.js` and `update.task.js`.

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
	'use strict';

// adapted from https://github.com/tc39/proposal-math-sum/blob/f4286d0a9d8525bda61be486df964bf2527c8789/polyfill/polyfill.mjs

// https://www-2.cs.cmu.edu/afs/cs/project/quake/public/papers/robust-arithmetic.ps
// Shewchuk's algorithm for exactly floating point addition
// as implemented in Python's fsum: https://github.com/python/cpython/blob/48dfd74a9db9d4aa9c6f23b4a67b461e5d977173/Modules/mathmodule.c#L1359-L1474
// adapted to handle overflow via an additional "biased" partial, representing 2**1024 times its actual value

// var MAX_SAFE_INTEGER = 9007199254740992; // Number.MAX_SAFE_INTEGER, 2**53

// exponent 11111111110, significand all 1s
var MAX_DOUBLE = 1.79769313486231570815e+308; // i.e. (2**1024 - 2**(1023 - 52))

// exponent 11111111110, significand all 1s except final 0
var PENULTIMATE_DOUBLE = 1.79769313486231550856e+308; // i.e. (2**1024 - 2 * 2**(1023 - 52))

var TWO_1023 = 8.98846567431158e+307; // 2 ** 1023

// exponent 11111001010, significand all 0s
var MAX_ULP = MAX_DOUBLE - PENULTIMATE_DOUBLE; // 1.99584030953471981166e+292, i.e. 2**(1023 - 52)

var $abs = Math.abs;

var INF = Infinity;

// prerequisite: $abs(x) >= $abs(y)
function twosum(x, y) {
	var hi = x + y;
	var lo = y - (hi - x);
	return { hi: hi, lo: lo };
}

/* eslint max-lines-per-function: 0, complexity: 0, no-plusplus: 0, no-implicit-coercion: 0 */

// preconditions:
//  - array only contains numbers
//  - none of them are -0, NaN, or ±Infinity
//  - all of them are finite
return function sum(array) {
	var partials = [];

	var overflow = 0; // conceptually 2**1024 times this value; the final partial is biased by this amount

	var index = -1;

	// main loop
	while ((index + 1) < array.length) {
		var x = +array[++index];

		// we're updating partials in place, but it is maybe easier to understand if you think of it as making a new copy
		var actuallyUsedPartials = 0;
		// var newPartials = [];
		for (var j = 0; j < partials.length; j += 1) {
			var y = partials[j];

			if ($abs(x) < $abs(y)) {
				var tmp = x;
				x = y;
				y = tmp;
			}
			var s = twosum(x, y);
			var hi = s.hi;
			var lo = s.lo;
			if ($abs(hi) === INF) {
				var sign = hi === INF ? 1 : -1;
				overflow += sign;

				x = (x - (sign * TWO_1023)) - (sign * TWO_1023);
				if ($abs(x) < $abs(y)) {
					var tmp2 = x;
					x = y;
					y = tmp2;
				}
				var s2 = twosum(x, y);
				hi = s2.hi;
				lo = s2.lo;
			}
			if (lo !== 0) {
				partials[actuallyUsedPartials] = lo;
				actuallyUsedPartials += 1;
				// newPartials.push(lo);
			}
			x = hi;
		}
		partials.length = actuallyUsedPartials;
		// assert.deepStrictEqual(partials, newPartials)
		// partials = newPartials

		if (x !== 0) {
			partials[partials.length] = x;
		}
	}

	// compute the exact sum of partials, stopping once we lose precision
	var n = partials.length - 1;
	hi = 0;
	lo = 0;

	if (overflow !== 0) {
		var next = n >= 0 ? partials[n] : 0;
		n -= 1;
		if (
			$abs(overflow) > 1
			|| (overflow > 0 && next > 0)
			|| (overflow < 0 && next < 0)
		) {
			return overflow > 0 ? INF : -INF;
		}
		// here we actually have to do the arithmetic
		// drop a factor of 2 so we can do it without overflow
		// assert($abs(overflow) === 1)
		s = twosum(overflow * TWO_1023, next / 2);
		hi = s.hi;
		lo = s.lo;
		lo *= 2;
		if ($abs(2 * hi) === INF) {
		// stupid edge case: rounding to the maximum value
		// MAX_DOUBLE has a 1 in the last place of its significand, so if we subtract exactly half a ULP from 2**1024, the result rounds away from it (i.e. to infinity) under ties-to-even
		// but if the next partial has the opposite sign of the current value, we need to round towards MAX_DOUBLE instead
		// this is the same as the "handle rounding" case below, but there's only one potentially-finite case we need to worry about, so we just hardcode that one
			if (hi > 0) {
				if (hi === TWO_1023 && lo === -(MAX_ULP / 2) && n >= 0 && partials[n] < 0) {
					return MAX_DOUBLE;
				}
				return INF;
			}
			if (hi === -TWO_1023 && lo === (MAX_ULP / 2) && n >= 0 && partials[n] > 0) {

				return -MAX_DOUBLE;
			}
			return -INF;
		}

		if (lo !== 0) {
			partials[n + 1] = lo;
			n += 1;
			lo = 0;
		}
		hi *= 2;
	}

	while (n >= 0) {
		var x1 = hi;
		var y1 = partials[n];
		n -= 1;
		// assert: $abs(x1) > $abs(y1)
		var s3 = twosum(x1, y1);
		hi = s3.hi;
		lo = s3.lo;
		if (lo !== 0) {
			break; // eslint-disable-line no-restricted-syntax
		}
	}

	// handle rounding
	// when the roundoff error is exactly half of the ULP for the result, we need to check one more partial to know which way to round
	if (
		n >= 0
		&& (
			(lo < 0.0 && partials[n] < 0.0)
			|| (lo > 0.0 && partials[n] > 0.0)
		)
	) {
		var y2 = lo * 2.0;
		var x2 = hi + y2;
		var yr = x2 - hi;
		if (y2 === yr) {
			hi = x2;
		}
	}

	return hi;
};

})();
