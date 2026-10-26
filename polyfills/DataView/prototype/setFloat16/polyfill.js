/* global CreateMethodProperty, DataView */
(function () {
	// Convert a number that is already rounded to binary16 into its bits, as NumericToRawBytes does for float16:
	function getFloat16Bits(n16) {
		if (n16 !== n16) {
			// The spec leaves the NaN bit pattern to the implementation.
			return 0x7e00;
		}
		var signBit = n16 < 0 || 1 / n16 === -Infinity ? 0x8000 : 0;
		var abs = Math.abs(n16);
		if (abs === Infinity) {
			return signBit | 0x7c00;
		}
		if (abs < 6.103515625e-5) {
			// A subnormal or zero, in units of 2^-24:
			return signBit | (abs * 16777216);
		}
		// A normal: find the exponent of its leading bit, from the smallest one of a normal on:
		var exponent = -14;
		while (abs >= Math.pow(2, exponent + 1)) {
			exponent++;
		}
		var fraction = abs * Math.pow(2, 10 - exponent) - 1024;
		return signBit | ((exponent + 15) << 10) | fraction;
	}

	// 25.3.4.18 DataView.prototype.setFloat16 ( byteOffset, value [ , littleEndian ] )
	CreateMethodProperty(DataView.prototype, "setFloat16", function setFloat16(byteOffset, value /* [ , littleEndian ] */) {
		// 1. Let view be the this value.
		var view = this;
		// 2. If littleEndian is not present, set littleEndian to false.
		var littleEndian = arguments.length > 2 ? arguments[2] : false;
		// 3. Perform ? SetViewValue(view, byteOffset, littleEndian, float16, value).
		// setUint16 writes values of the same element size, so it performs the steps of SetViewValue in the same order.
		// It converts its value right after byteOffset, which is when this object converts value to a number and its bits:
		DataView.prototype.setUint16.call(view, byteOffset, {
			valueOf: function () {
				// Math.f16round performs ToNumber(value) and the rounding to binary16 of NumericToRawBytes:
				return getFloat16Bits(Math.f16round(value));
			}
		}, littleEndian);
		// 4. Return undefined.
		return undefined;
	});
})();
