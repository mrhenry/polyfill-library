it("is a function", function () {
	proclaim.isFunction(Math.f16round);
});

it("has correct arity", function () {
	proclaim.arity(Math.f16round, 1);
});

it("has correct name", function () {
	proclaim.hasName(Math.f16round, "f16round");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Math, "f16round");
});

describe("f16round", function () {
	it("returns NaN for NaN and values that convert to NaN", function () {
		proclaim.isTrue(isNaN(Math.f16round(NaN)));
		proclaim.isTrue(isNaN(Math.f16round()));
		proclaim.isTrue(isNaN(Math.f16round({})));
	});

	it("returns zeros and infinities unchanged", function () {
		proclaim.strictEqual(1 / Math.f16round(0), Infinity);
		proclaim.strictEqual(1 / Math.f16round(-0), -Infinity);
		proclaim.strictEqual(Math.f16round(Infinity), Infinity);
		proclaim.strictEqual(Math.f16round(-Infinity), -Infinity);
	});

	it("converts its argument to a number", function () {
		proclaim.strictEqual(Math.f16round("1.5"), 1.5);
		proclaim.strictEqual(Math.f16round(true), 1);
		proclaim.strictEqual(Math.f16round({ valueOf: function () { return 2; } }), 2);
	});

	it("returns binary16 values unchanged", function () {
		proclaim.strictEqual(Math.f16round(1), 1);
		proclaim.strictEqual(Math.f16round(-2.5), -2.5);
		proclaim.strictEqual(Math.f16round(65504), 65504);
		proclaim.strictEqual(Math.f16round(6.103515625e-5), 6.103515625e-5);
		proclaim.strictEqual(Math.f16round(5.960464477539063e-8), 5.960464477539063e-8);
	});

	it("rounds to the nearest binary16 value", function () {
		proclaim.strictEqual(Math.f16round(1.337), 1.3369140625);
		proclaim.strictEqual(Math.f16round(-1.337), -1.3369140625);
		proclaim.strictEqual(Math.f16round(0.1), 0.0999755859375);
	});

	it("rounds ties to even", function () {
		// Halfway between 1 and 1 + 2^-10:
		proclaim.strictEqual(Math.f16round(1 + Math.pow(2, -11)), 1);
		// Halfway between 1 + 2^-10 and 1 + 2^-9:
		proclaim.strictEqual(Math.f16round(1 + 3 * Math.pow(2, -11)), 1 + Math.pow(2, -9));
		// Halfway between 0 and the smallest subnormal:
		proclaim.strictEqual(1 / Math.f16round(Math.pow(2, -25)), Infinity);
		proclaim.strictEqual(1 / Math.f16round(-Math.pow(2, -25)), -Infinity);
		// Halfway between the smallest two subnormals:
		proclaim.strictEqual(Math.f16round(3 * Math.pow(2, -25)), Math.pow(2, -23));
	});

	it("does not round twice, as rounding through binary32 would", function () {
		proclaim.strictEqual(Math.f16round(1.00048828125000022204), 1.0009765625);
	});

	it("rounds beyond the largest binary16 value to infinity from 65520 on", function () {
		proclaim.strictEqual(Math.f16round(65519.99), 65504);
		proclaim.strictEqual(Math.f16round(65520), Infinity);
		proclaim.strictEqual(Math.f16round(-65520), -Infinity);
		proclaim.strictEqual(Math.f16round(1e308), Infinity);
	});
});
