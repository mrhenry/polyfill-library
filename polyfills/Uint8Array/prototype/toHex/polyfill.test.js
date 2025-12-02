/* global Uint8Array */

it("is a function", function () {
	proclaim.isFunction(Uint8Array.prototype.toHex);
});

it("has correct arity", function () {
	proclaim.arity(Uint8Array.prototype.toHex, 0);
});

it("has correct name", function () {
	proclaim.hasName(Uint8Array.prototype.toHex, "toHex");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Uint8Array.prototype, "toHex");
});

describe("toHex", function () {
	it("should get a hex string from a byte array", function () {
		var uint8Array = new Uint8Array([29, 233, 101, 161]);
		proclaim.equal(uint8Array.toHex(), "1de965a1");
	});
});
