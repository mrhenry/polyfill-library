/* global Uint8Array */

it("is a function", function () {
	proclaim.isFunction(Uint8Array.fromHex);
});

it("has correct arity", function () {
	proclaim.arity(Uint8Array.fromHex, 1);
});

it("has correct name", function () {
	proclaim.hasName(Uint8Array.fromHex, "fromHex");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Uint8Array, "fromHex");
});

describe("fromHex", function () {
	it("should create a byte array from a hex string", function () {
		var uint8Array = Uint8Array.fromHex("cafed00d");
		proclaim.deepStrictEqual(uint8Array, new Uint8Array([202, 254, 208, 13]));

		proclaim.deepStrictEqual(Uint8Array.fromHex("CAFED00D"), new Uint8Array([202, 254, 208, 13]));

		proclaim.throws(function () {
			Uint8Array.fromHex("c")
		}, SyntaxError);
		proclaim.throws(function () {
			Uint8Array.fromHex("z")
		}, SyntaxError);
	});
});
