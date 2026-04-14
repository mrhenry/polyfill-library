/* global Uint8Array */

it("is a function", function () {
	proclaim.isFunction(Uint8Array.prototype.setFromHex);
});

it("has correct arity", function () {
	proclaim.arity(Uint8Array.prototype.setFromHex, 1);
});

it("has correct name", function () {
	proclaim.hasName(Uint8Array.prototype.setFromHex, "setFromHex");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Uint8Array.prototype, "setFromHex");
});

describe("setFromHex", function () {
	it("should populate a byte array from a hex string", function () {
		var uint8Array = new Uint8Array(6);
		var result = uint8Array.setFromHex("cafed00d");
		proclaim.deepStrictEqual(result, { read: 8, written: 4 });
		proclaim.deepStrictEqual(uint8Array, new Uint8Array([202, 254, 208, 13, 0, 0]));

		uint8Array = new Uint8Array(6);
		result = uint8Array.setFromHex("CAFED00D");
		proclaim.deepStrictEqual(result, { read: 8, written: 4 });
		proclaim.deepStrictEqual(uint8Array, new Uint8Array([202, 254, 208, 13, 0, 0]));

		proclaim.throws(function () {
			uint8Array.setFromHex("c")
		}, SyntaxError);
		proclaim.throws(function () {
			uint8Array.setFromHex("z")
		}, SyntaxError);
	});
});
