/* global ArrayBuffer, DataView */

it("is a function", function () {
	proclaim.isFunction(DataView.prototype.setFloat16);
});

it("has correct arity", function () {
	proclaim.arity(DataView.prototype.setFloat16, 2);
});

it("has correct name", function () {
	proclaim.hasName(DataView.prototype.setFloat16, "setFloat16");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(DataView.prototype, "setFloat16");
});

describe("setFloat16", function () {
	function bitsOf(value, littleEndian) {
		var view = new DataView(new ArrayBuffer(4));
		view.setFloat16(1, value, littleEndian);
		return view.getUint16(1, littleEndian);
	}

	it("returns undefined", function () {
		proclaim.isUndefined(new DataView(new ArrayBuffer(2)).setFloat16(0, 1));
	});

	it("writes big-endian values by default", function () {
		proclaim.strictEqual(bitsOf(1), 0x3c00);
		proclaim.strictEqual(bitsOf(-2), 0xc000);
		proclaim.strictEqual(bitsOf(1.5), 0x3e00);
		proclaim.strictEqual(bitsOf(65504), 0x7bff);
		var view = new DataView(new ArrayBuffer(2));
		view.setFloat16(0, 1);
		proclaim.strictEqual(view.getUint8(0), 0x3c);
		proclaim.strictEqual(view.getUint8(1), 0x00);
	});

	it("writes little-endian values", function () {
		var view = new DataView(new ArrayBuffer(2));
		view.setFloat16(0, 1, true);
		proclaim.strictEqual(view.getUint8(0), 0x00);
		proclaim.strictEqual(view.getUint8(1), 0x3c);
	});

	it("writes zeros, subnormals, infinities and NaN", function () {
		proclaim.strictEqual(bitsOf(0), 0x0000);
		proclaim.strictEqual(bitsOf(-0), 0x8000);
		proclaim.strictEqual(bitsOf(5.960464477539063e-8), 0x0001);
		proclaim.strictEqual(bitsOf(6.097555160522461e-5), 0x03ff);
		proclaim.strictEqual(bitsOf(6.103515625e-5), 0x0400);
		proclaim.strictEqual(bitsOf(Infinity), 0x7c00);
		proclaim.strictEqual(bitsOf(-Infinity), 0xfc00);
		var nan = bitsOf(NaN);
		proclaim.strictEqual(nan & 0x7c00, 0x7c00);
		proclaim.notStrictEqual(nan & 0x03ff, 0);
	});

	it("rounds to binary16, ties to even, without rounding twice", function () {
		proclaim.strictEqual(bitsOf(1 + Math.pow(2, -11)), 0x3c00);
		proclaim.strictEqual(bitsOf(1.00048828125000022204), 0x3c01);
		proclaim.strictEqual(bitsOf(65520), 0x7c00);
	});

	it("converts byteOffset before value, as the spec requires", function () {
		var log = [];
		new DataView(new ArrayBuffer(2)).setFloat16(
			{ valueOf: function () { log.push("byteOffset"); return 0; } },
			{ valueOf: function () { log.push("value"); return 1; } }
		);
		proclaim.deepStrictEqual(log, ["byteOffset", "value"]);
	});

	it("throws a RangeError past the end of the view", function () {
		proclaim.throws(function () {
			new DataView(new ArrayBuffer(2)).setFloat16(1, 1);
		}, RangeError);
	});

	it("throws a TypeError for an invalid `this`", function () {
		proclaim.throws(function () {
			DataView.prototype.setFloat16.call({}, 0, 1);
		}, TypeError);
	});
});
