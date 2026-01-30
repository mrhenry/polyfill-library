/* global Uint8Array */

it("is a function", function () {
	proclaim.isFunction(Uint8Array.fromBase64);
});

it("has correct arity", function () {
	proclaim.arity(Uint8Array.fromBase64, 1);
});

it("has correct name", function () {
	proclaim.hasName(Uint8Array.fromBase64, "fromBase64");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Uint8Array, "fromBase64");
});

describe("fromBase64", function () {
	it("should create a byte array from a base64 string", function () {
		var uint8Array = Uint8Array.fromBase64("PGI+ TURO PC9i Ph");
		proclaim.deepStrictEqual(uint8Array, new Uint8Array([60, 98, 62, 77, 68, 78, 60, 47, 98, 62]));

		proclaim.throws(function () {
			Uint8Array.fromBase64("PGI-");
		}, SyntaxError);
	});

	it("should create a byte array from a base64 string, with base64url alphabet", function () {
		proclaim.deepStrictEqual(Uint8Array.fromBase64("PGI-TUROPC9iPg", {
			alphabet: "base64url"
		}), new Uint8Array([60, 98, 62, 77, 68, 78, 60, 47, 98, 62]));
		proclaim.throws(function () {
			Uint8Array.fromBase64("PGI+", {
				alphabet: "base64url"
			});
		}, SyntaxError);
	});

	it("should create a byte array from a base64 string, with strict last chunk handling", function () {
		proclaim.deepStrictEqual(Uint8Array.fromBase64("PGI+ TURO PC9i Pg==", {
			lastChunkHandling: "strict"
		}), new Uint8Array([60, 98, 62, 77, 68, 78, 60, 47, 98, 62]));
		proclaim.throws(function () {
			Uint8Array.fromBase64("PGI+ TURO PC9i Ph==", {
				lastChunkHandling: "strict"
			});
		}, SyntaxError);
		proclaim.throws(function () {
			Uint8Array.fromBase64("PGI+ TURO PC9i Pg", {
				lastChunkHandling: "strict"
			});
		}, SyntaxError);
	});

	it("should create a byte array from a base64 string, with partial last chunk handling", function () {
		proclaim.deepStrictEqual(Uint8Array.fromBase64("PGI+ TURO PC9i", {
			lastChunkHandling: "stop-before-partial"
		}), new Uint8Array([60, 98, 62, 77, 68, 78, 60, 47, 98]));
		proclaim.deepStrictEqual(Uint8Array.fromBase64("PGI+ TURO PC9i Pg==", {
			lastChunkHandling: "stop-before-partial"
		}), new Uint8Array([60, 98, 62, 77, 68, 78, 60, 47, 98, 62]));
		proclaim.deepStrictEqual(Uint8Array.fromBase64("PGI+ TURO PC9i Pg", {
			lastChunkHandling: "stop-before-partial"
		}), new Uint8Array([60, 98, 62, 77, 68, 78, 60, 47, 98]));
		proclaim.deepStrictEqual(Uint8Array.fromBase64("PGI+ TURO PC9i Pg=", {
			lastChunkHandling: "stop-before-partial"
		}), new Uint8Array([60, 98, 62, 77, 68, 78, 60, 47, 98]));
		proclaim.throws(function () {
			Uint8Array.fromBase64("PGI+ TURO PC9i P=", {
				lastChunkHandling: "strict"
			});
		}, SyntaxError);
	});
});
