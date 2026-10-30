/* global ArrayBuffer, DataView */

it("is a function", function () {
	proclaim.isFunction(DataView.prototype.getFloat16);
});

it("has correct arity", function () {
	proclaim.arity(DataView.prototype.getFloat16, 1);
});

it("has correct name", function () {
	proclaim.hasName(DataView.prototype.getFloat16, "getFloat16");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(DataView.prototype, "getFloat16");
});

describe("getFloat16", function () {
	function viewOf(bits, littleEndian) {
		var view = new DataView(new ArrayBuffer(4));
		view.setUint16(1, bits, littleEndian);
		return view;
	}

	it("reads big-endian values by default", function () {
		proclaim.strictEqual(viewOf(0x3c00).getFloat16(1), 1);
		proclaim.strictEqual(viewOf(0xc000).getFloat16(1), -2);
		proclaim.strictEqual(viewOf(0x3e00).getFloat16(1), 1.5);
		proclaim.strictEqual(viewOf(0x7bff).getFloat16(1), 65504);
	});

	it("reads little-endian values", function () {
		proclaim.strictEqual(viewOf(0x3c00, true).getFloat16(1, true), 1);
		proclaim.strictEqual(viewOf(0x3555, true).getFloat16(1, true), 0.333251953125);
	});

	it("reads zeros, subnormals, infinities and NaN", function () {
		proclaim.strictEqual(1 / viewOf(0x0000).getFloat16(1), Infinity);
		proclaim.strictEqual(1 / viewOf(0x8000).getFloat16(1), -Infinity);
		proclaim.strictEqual(viewOf(0x0001).getFloat16(1), 5.960464477539063e-8);
		proclaim.strictEqual(viewOf(0x03ff).getFloat16(1), 6.097555160522461e-5);
		proclaim.strictEqual(viewOf(0x0400).getFloat16(1), 6.103515625e-5);
		proclaim.strictEqual(viewOf(0x7c00).getFloat16(1), Infinity);
		proclaim.strictEqual(viewOf(0xfc00).getFloat16(1), -Infinity);
		proclaim.isTrue(isNaN(viewOf(0x7e00).getFloat16(1)));
	});

	it("throws a RangeError past the end of the view", function () {
		proclaim.throws(function () {
			new DataView(new ArrayBuffer(2)).getFloat16(1);
		}, RangeError);
		proclaim.throws(function () {
			new DataView(new ArrayBuffer(2)).getFloat16(-1);
		}, RangeError);
	});

	it("throws a TypeError for an invalid `this`", function () {
		proclaim.throws(function () {
			DataView.prototype.getFloat16.call({}, 0);
		}, TypeError);
	});
});
