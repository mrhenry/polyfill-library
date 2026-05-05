/* global Uint8Array */

it("is a function", function () {
	proclaim.isFunction(Uint8Array.prototype.toBase64);
});

it("has correct arity", function () {
	proclaim.arity(Uint8Array.prototype.toBase64, 0);
});

it("has correct name", function () {
	proclaim.hasName(Uint8Array.prototype.toBase64, "toBase64");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Uint8Array.prototype, "toBase64");
});

describe("toBase64", function () {
	it("should get a base64 string from a byte array", function () {
		var uint8Array = new Uint8Array([29, 233, 101, 161]);
		proclaim.equal(uint8Array.toBase64(), "HelloQ==");
	});

	it("should get a base64 string from a byte array, with base64url alphabet", function () {
		var uint8Array = new Uint8Array([29, 233, 101, 163, 244]);
		proclaim.equal(uint8Array.toBase64({
			alphabet: "base64url"
		}), "Hello_Q=");
	});

	it("should get a base64 string from a byte array, without padding", function () {
		var uint8Array = new Uint8Array([29, 233, 101, 161]);
		proclaim.equal(uint8Array.toBase64({
			omitPadding: true
		}), "HelloQ");
	});
});
