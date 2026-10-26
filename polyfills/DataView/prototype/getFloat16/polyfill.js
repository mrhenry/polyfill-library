/* global CreateMethodProperty, DataView */
// 25.3.4.7 DataView.prototype.getFloat16 ( byteOffset [ , littleEndian ] )
CreateMethodProperty(DataView.prototype, "getFloat16", function getFloat16(byteOffset /* [ , littleEndian ] */) {
	// 1. Let view be the this value.
	var view = this;
	// 2. If littleEndian is not present, set littleEndian to false.
	var littleEndian = arguments.length > 1 ? arguments[1] : false;
	// 3. Return ? GetViewValue(view, byteOffset, littleEndian, float16).
	// getUint16 reads values of the same element size, so it performs the steps of GetViewValue in the same order.
	var bits = DataView.prototype.getUint16.call(view, byteOffset, littleEndian);
	// Convert the bits as RawBytesToNumeric does for float16, from IEEE 754-2019 binary16 format:
	var sign = bits & 0x8000 ? -1 : 1;
	var exponent = (bits >> 10) & 0x1f;
	var fraction = bits & 0x3ff;
	if (exponent === 0) {
		// A subnormal or zero, in units of 2^-24:
		return sign * fraction * 5.960464477539063e-8;
	}
	if (exponent === 0x1f) {
		return fraction === 0 ? sign * Infinity : NaN;
	}
	// A normal: (1 + fraction / 2^10) * 2^(exponent - 15)
	return sign * (1024 + fraction) * Math.pow(2, exponent - 25);
});
