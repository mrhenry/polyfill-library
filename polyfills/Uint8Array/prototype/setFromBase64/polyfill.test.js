/* global Uint8Array */

it("is a function", function () {
	proclaim.isFunction(Uint8Array.prototype.setFromBase64);
});

it("has correct arity", function () {
	proclaim.arity(Uint8Array.prototype.setFromBase64, 1);
});

it("has correct name", function () {
	proclaim.hasName(Uint8Array.prototype.setFromBase64, "setFromBase64");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Uint8Array.prototype, "setFromBase64");
});

describe("setFromBase64", function () {
	it("should populate a byte array from a base64 string", function () {
		var uint8Array = new Uint8Array(16);
		var result = uint8Array.setFromBase64("PGI+ TURO PC9i Pg==");
		proclaim.deepStrictEqual(result, { read: 19, written: 10 });
		proclaim.deepStrictEqual(uint8Array, new Uint8Array([60, 98, 62, 77, 68, 78, 60, 47, 98, 62, 0, 0, 0, 0, 0, 0]));

		proclaim.throws(function () {
			Uint8Array.fromBase64("PGI-");
		}, SyntaxError);
	});

	it("should populate a byte array from a longer base64 string", function () {
		var uint8Array = new Uint8Array(8);
		var result = uint8Array.setFromBase64("PGI+ TURO PC9i Pg==");
		proclaim.deepStrictEqual(result, { read: 9, written: 6 });
		proclaim.deepStrictEqual(uint8Array, new Uint8Array([60, 98, 62, 77, 68, 78, 0, 0]));

		proclaim.throws(function () {
			uint8Array.setFromBase64("PGI+", {
				alphabet: "base64url"
			});
		}, SyntaxError);
	});

	it("should populate a byte array from a base64 string, with base64url alphabet", function () {
		var uint8Array = new Uint8Array(8);
		var result = uint8Array.setFromBase64("PGI-TUROPC9iPg", {
			alphabet: "base64url"
		});
		proclaim.deepStrictEqual(result, { read: 8, written: 6 });
		proclaim.deepStrictEqual(uint8Array, new Uint8Array([60, 98, 62, 77, 68, 78, 0, 0]));
	});

	it("should populate a byte array from a base64 string, with strict last chunk handling", function () {
		var uint8Array = new Uint8Array(10);
		var result = uint8Array.setFromBase64("PGI+ TURO PC9i Pg==", {
			lastChunkHandling: "strict"
		});
		proclaim.deepStrictEqual(result, { read: 19, written: 10 });
		proclaim.deepStrictEqual(uint8Array, new Uint8Array([60, 98, 62, 77, 68, 78, 60, 47, 98, 62]));
		proclaim.throws(function () {
			uint8Array.setFromBase64("PGI+ TURO PC9i Ph==", {
				lastChunkHandling: "strict"
			});
		}, SyntaxError);
		proclaim.throws(function () {
			uint8Array.setFromBase64("PGI+ TURO PC9i Pg", {
				lastChunkHandling: "strict"
			});
		}, SyntaxError);
	});

	it("should populate a byte array from a base64 string, with partial last chunk handling", function () {
		var uint8Array = new Uint8Array(10);
		proclaim.deepStrictEqual(uint8Array.setFromBase64("PGI+ TURO PC9i", {
			lastChunkHandling: "stop-before-partial"
		}), { read: 14, written: 9 });
		proclaim.deepStrictEqual(uint8Array.setFromBase64("PGI+ TURO PC9i Pg==", {
			lastChunkHandling: "stop-before-partial"
		}), { read: 19, written: 10 });
		proclaim.deepStrictEqual(uint8Array.setFromBase64("PGI+ TURO PC9i Pg", {
			lastChunkHandling: "stop-before-partial"
		}), { read: 14, written: 9 });
		proclaim.deepStrictEqual(uint8Array.setFromBase64("PGI+ TURO PC9i Pg=", {
			lastChunkHandling: "stop-before-partial"
		}), { read: 14, written: 9 });
		proclaim.throws(function () {
			uint8Array.setFromBase64("PGI+ TURO PC9i P=", {
				lastChunkHandling: "strict"
			});
		}, SyntaxError);
	});
});
