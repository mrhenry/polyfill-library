/* global CreateMethodProperty, ToNumber */
// 21.3.2.18 Math.f16round ( x )
CreateMethodProperty(Math, "f16round", function f16round(x) {
	// 1. Let n be ? ToNumber(x).
	var n = ToNumber(x);
	// 2. If n is NaN, return NaN.
	if (n !== n) {
		return NaN;
	}
	// 3. If n is one of +0𝔽, -0𝔽, +∞𝔽, or -∞𝔽, return n.
	if (n === 0 || n === Infinity || n === -Infinity) {
		return n;
	}
	// 4. Let n16 be the result of converting n to IEEE 754-2019 binary16 format using roundTiesToEven mode.
	// 5. Let n64 be the result of converting n16 to IEEE 754-2019 binary64 format.
	// 6. Return the ECMAScript Number value corresponding to n64.
	// Round directly, as rounding to binary32 first could round twice.
	var sign = n < 0 ? -1 : 1;
	var abs = n * sign;
	var n16;
	if (abs < 6.103515625e-5) {
		// A subnormal: round to a multiple of 2^-24, as adding and subtracting 2^52 rounds to an integer, ties to even.
		n16 = (abs * 16777216 + 4503599627370496 - 4503599627370496) / 16777216;
	} else if (abs < 65520) {
		// A normal: round to 11 significant bits, ties to even, by Veltkamp splitting with the factor 2^42 + 1.
		var a = abs * 4398046511105;
		n16 = a - (a - abs);
	} else {
		// From the midpoint between the largest binary16 number 65504 and 65536 on, round to infinity.
		n16 = Infinity;
	}
	return sign * n16;
});
