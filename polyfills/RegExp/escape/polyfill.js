/* global CreateMethodProperty, EncodeForRegExpEscape, StringToCodePoints */
// 22.2.5.1 RegExp.escape ( S )
CreateMethodProperty(RegExp, "escape", function escape(S) {
	// 1. If S is not a String, throw a TypeError exception.
	if (typeof S !== "string") {
		throw new TypeError("S must be a string");
	}
	// 2. Let escaped be the empty String.
	var escaped = "";
	// 3. Let cpList be StringToCodePoints(S).
	var cpList = StringToCodePoints(S);
	// 4. For each code point c of cpList, do
	for (var i = 0; i < cpList.length; i++) {
		var c = cpList[i];
		// a. If escaped is the empty String and c is matched by either DecimalDigit or AsciiLetter, then
		if (
			escaped === "" &&
			((c >= 0x0030 && c <= 0x0039) || // 0-9
				(c >= 0x0041 && c <= 0x005a) || // A-Z
				(c >= 0x0061 && c <= 0x007a)) // a-z
		) {
			// i. NOTE: Escaping a leading digit ensures that output corresponds with pattern text which may be used after a \0 character escape or a DecimalEscape such as \1 and still match S rather than be interpreted as an extension of the preceding escape sequence. Escaping a leading ASCII letter does the same for the context after \c.
			// ii. Let numericValue be the numeric value of c.
			var numericValue = c;
			// iii. Let hex be Number::toString(𝔽(numericValue), 16).
			var hex = Number.prototype.toString.call(numericValue, 16);
			// iv. Assert: The length of hex is 2.
			// v. Set escaped to the string-concatenation of the code unit 0x005C (REVERSE SOLIDUS), "x", and hex.
			escaped = "\\x" + hex;
		}
		// b. Else,
		else {
			// i. Set escaped to the string-concatenation of escaped and EncodeForRegExpEscape(c).
			escaped += EncodeForRegExpEscape(c);
		}
	}
	// 5. Return escaped.
	return escaped;
});
