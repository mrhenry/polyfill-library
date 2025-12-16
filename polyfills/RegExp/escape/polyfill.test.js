it("is a function", function () {
	proclaim.isFunction(RegExp.escape);
});

it("has correct arity", function () {
	proclaim.arity(RegExp.escape, 1);
});

it("has correct name", function () {
	proclaim.hasName(RegExp.escape, "escape");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(RegExp, "escape");
});

describe("escape", function () {
	it("escapes special regex characters", function () {
		proclaim.strictEqual(RegExp.escape("10$"), "\\x310\\$");
		proclaim.strictEqual(RegExp.escape("abcdefg_123456"), "\\x61bcdefg_123456");
		proclaim.strictEqual(RegExp.escape("Привет"), "Привет");
		proclaim.strictEqual(
			RegExp.escape("(){}[]|,.?*+-^$=<>\\/#&!%:;@~'\"`"),
			"\\(\\)\\{\\}\\[\\]\\|\\x2c\\.\\?\\*\\+\\x2d\\^\\$\\x3d\\x3c\\x3e\\\\\\/\\x23\\x26\\x21\\x25\\x3a\\x3b\\x40\\x7e\\x27\\x22\\x60"
		);
		proclaim.strictEqual(
			RegExp.escape(
				"\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF"
			),
			"\\t\\n\\v\\f\\r\\x20\\xa0\\u1680\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\u2028\\u2029\\ufeff"
		);

		proclaim.strictEqual(RegExp.escape("💩"), "💩");
		proclaim.strictEqual(RegExp.escape("\uD83D"), "\\ud83d");
		proclaim.strictEqual(RegExp.escape("\uDCA9"), "\\udca9");
		proclaim.strictEqual(RegExp.escape("\uDCA9\uD83D"), "\\udca9\\ud83d");
	});

	it("throws on non-string input", function () {
		proclaim.throws(function () {
			RegExp.escape(42);
		}, TypeError);
		proclaim.throws(function () {
			RegExp.escape({});
		}, TypeError);
	});
});
