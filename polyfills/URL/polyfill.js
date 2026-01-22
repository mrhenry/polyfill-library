/* eslint-disable no-useless-escape */
/* eslint-disable no-control-regex */


/* global Uint8Array, Symbol, CreateMethodProperty, _tr46_bidiDomain, _tr46_bidiS1LTR, _tr46_bidiS1RTL, _tr46_bidiS2, _tr46_bidiS3, _tr46_bidiS4AN, _tr46_bidiS4EN, _tr46_bidiS5, _tr46_bidiS6, _tr46_combiningClassVirama, _tr46_combiningMarks, _tr46_mappingTable, _tr46_STATUS_MAPPING, _tr46_validZWNJ */

(function (global) {
	'use strict';

	/** Highest positive signed 32-bit float value */
	var punycode_maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	var punycode_base = 36;
	var punycode_tMin = 1;
	var punycode_tMax = 26;
	var punycode_skew = 38;
	var punycode_damp = 700;
	var punycode_initialBias = 72;
	var punycode_initialN = 128; // 0x80
	var punycode_delimiter = '-'; // '\x2D'

	/** Regular expressions */
	var punycode_regexPunycode = /^xn--/;
	var punycode_regexNonASCII = /[^\0-\x7F]/; // Note: U+007F DEL is excluded too.
	var punycode_regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

	/** Error messages */
	var punycode_errors = {
		overflow: 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	};

	/** Convenience shortcuts */
	var punycode_baseMinusTMin = punycode_base - punycode_tMin;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function punycode_error(type) {
		throw new RangeError(punycode_errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function punycode_map(array, callback) {
		var result = [];
		var length = array.length;
		while (length--) {
			result[length] = callback(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {String} A new string of characters returned by the callback
	 * function.
	 */
	function punycode_mapDomain(domain, callback) {
		var parts = domain.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			domain = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		domain = domain.replace(punycode_regexSeparators, '\x2E');
		var labels = domain.split('.');
		var encoded = punycode_map(labels, callback).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function punycode_ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		while (counter < length) {
			var value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// It's a high surrogate, and there is a next character.
				var extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// It's an unmatched surrogate; only append this code unit, in case the
					// next code unit is the high surrogate of a surrogate pair.
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function punycode_ucs2encode(codePoints) {
		return String.fromCodePoint.apply(null, codePoints);
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function punycode_basicToDigit(codePoint) {
		if (codePoint >= 0x30 && codePoint < 0x3A) {
			return 26 + (codePoint - 0x30);
		}
		if (codePoint >= 0x41 && codePoint < 0x5B) {
			return codePoint - 0x41;
		}
		if (codePoint >= 0x61 && codePoint < 0x7B) {
			return codePoint - 0x61;
		}
		return punycode_base;
	};

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function punycode_digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	};

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function punycode_adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? Math.floor(delta / punycode_damp) : delta >> 1;
		delta += Math.floor(delta / numPoints);
		for (/* no initialization */; delta > punycode_baseMinusTMin * punycode_tMax >> 1; k += punycode_base) {
			delta = Math.floor(delta / punycode_baseMinusTMin);
		}
		return Math.floor(k + (punycode_baseMinusTMin + 1) * delta / (delta + punycode_skew));
	};

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function punycode_decode(input) {
		// Don't use UCS-2.
		var output = [];
		var inputLength = input.length;
		var i = 0;
		var n = punycode_initialN;
		var bias = punycode_initialBias;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		var basic = input.lastIndexOf(punycode_delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (var j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				punycode_error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (var index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			var oldi = i;
			for (var w = 1, k = punycode_base; /* no condition */; k += punycode_base) {

				if (index >= inputLength) {
					punycode_error('invalid-input');
				}

				var digit = punycode_basicToDigit(input.charCodeAt(index++));

				if (digit >= punycode_base) {
					punycode_error('invalid-input');
				}
				if (digit > Math.floor((punycode_maxInt - i) / w)) {
					punycode_error('overflow');
				}

				i += digit * w;
				var t = k <= bias ? punycode_tMin : (k >= bias + punycode_tMax ? punycode_tMax : k - bias);

				if (digit < t) {
					break;
				}

				var baseMinusT = punycode_base - t;
				if (w > Math.floor(punycode_maxInt / baseMinusT)) {
					punycode_error('overflow');
				}

				w *= baseMinusT;

			}

			var out = output.length + 1;
			bias = punycode_adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (Math.floor(i / out) > punycode_maxInt - n) {
				punycode_error('overflow');
			}

			n += Math.floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output.
			output.splice(i++, 0, n);

		}

		return String.fromCodePoint.apply(null, output);
	};

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function punycode_encode(input) {
		var output = [];

		// Convert the input in UCS-2 to an array of Unicode code points.
		input = punycode_ucs2decode(input);

		// Cache the length.
		var inputLength = input.length;

		// Initialize the state.
		var n = punycode_initialN;
		var delta = 0;
		var bias = punycode_initialBias;

		// Handle the basic code points.
		for (var i = 0; i < input.length; i++) {
			var currentValue = input[i];
			if (currentValue < 0x80) {
				output.push(String.fromCharCode(currentValue));
			}
		}

		var basicLength = output.length;
		var handledCPCount = basicLength;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string with a delimiter unless it's empty.
		if (basicLength) {
			output.push(punycode_delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			var m = punycode_maxInt;
			for (var i2 = 0; i2 < input.length; i2++) {
				var currentValue2 = input[i2];
				if (currentValue2 >= n && currentValue2 < m) {
					m = currentValue2;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow.
			var handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > Math.floor((punycode_maxInt - delta) / handledCPCountPlusOne)) {
				punycode_error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (var i3 = 0; i3 < input.length; i3++) {
				var currentValue3 = input[i3];
				if (currentValue3 < n && ++delta > punycode_maxInt) {
					punycode_error('overflow');
				}
				if (currentValue3 === n) {
					// Represent delta as a generalized variable-length integer.
					var q = delta;
					for (var k = punycode_base; /* no condition */; k += punycode_base) {
						var t = k <= bias ? punycode_tMin : (k >= bias + punycode_tMax ? punycode_tMax : k - bias);
						if (q < t) {
							break;
						}
						var qMinusT = q - t;
						var baseMinusT = punycode_base - t;
						output.push(
							String.fromCharCode(punycode_digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = Math.floor(qMinusT / baseMinusT);
					}

					output.push(String.fromCharCode(punycode_digitToBasic(q, 0)));
					bias = punycode_adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	};

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function punycode_toUnicode(input) {
		return punycode_mapDomain(input, function (string) {
			return punycode_regexPunycode.test(string)
				? punycode_decode(string.slice(4).toLowerCase())
				: string;
		});
	};

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function punycode_toASCII(input) {
		return punycode_mapDomain(input, function (string) {
			return punycode_regexNonASCII.test(string)
				? 'xn--' + punycode_encode(string)
				: string;
		});
	};





	function tr46_containsNonASCII(str) {
		return /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/.test(str);
	}

	function tr46_findStatus(val, options) {
		var useSTD3ASCIIRules = options.useSTD3ASCIIRules;
		var start = 0;
		var end = _tr46_mappingTable.length - 1;

		while (start <= end) {
			var mid = Math.floor((start + end) / 2);

			var target = _tr46_mappingTable[mid];
			var min = Array.isArray(target[0]) ? target[0][0] : target[0];
			var max = Array.isArray(target[0]) ? target[0][1] : target[0];

			if (min <= val && max >= val) {
				if (useSTD3ASCIIRules &&
					(target[1] === _tr46_STATUS_MAPPING.disallowed_STD3_valid || target[1] === _tr46_STATUS_MAPPING.disallowed_STD3_mapped)) {
					return [_tr46_STATUS_MAPPING.disallowed].concat(target.slice(2));
				} else if (target[1] === _tr46_STATUS_MAPPING.disallowed_STD3_valid) {
					return [_tr46_STATUS_MAPPING.valid].concat(target.slice(2));
				} else if (target[1] === _tr46_STATUS_MAPPING.disallowed_STD3_mapped) {
					return [_tr46_STATUS_MAPPING.mapped].concat(target.slice(2));
				}

				return target.slice(1);
			} else if (min > val) {
				end = mid - 1;
			} else {
				start = mid + 1;
			}
		}

		return null;
	}

	function tr46_mapChars(domainName, options) {
		var useSTD3ASCIIRules = options.useSTD3ASCIIRules;
		var transitionalProcessing = options.transitionalProcessing;
		var processed = "";

		var chars = Array.from(domainName);
		for (var i = 0; i < chars.length; i++) {
			var ch = chars[i];
			var foundStatus = tr46_findStatus(ch.codePointAt(0), { useSTD3ASCIIRules: useSTD3ASCIIRules });
			var status = foundStatus[0];
			var mapping = foundStatus[1];

			switch (status) {
				case _tr46_STATUS_MAPPING.disallowed:
					processed += ch;
					break;
				case _tr46_STATUS_MAPPING.ignored:
					break;
				case _tr46_STATUS_MAPPING.mapped:
					if (transitionalProcessing && ch === "ẞ") {
						processed += "ss";
					} else {
						processed += mapping;
					}
					break;
				case _tr46_STATUS_MAPPING.deviation:
					if (transitionalProcessing) {
						processed += mapping;
					} else {
						processed += ch;
					}
					break;
				case _tr46_STATUS_MAPPING.valid:
					processed += ch;
					break;
			}
		}

		return processed;
	}

	function tr46_validateLabel(label, options) {
		if (typeof options === 'undefined') options = {};

		var checkHyphens = ('checkHyphens' in options) ? options.checkHyphens : false;
		var checkBidi = ('checkBidi' in options) ? options.checkBidi : false;
		var checkJoiners = ('checkJoiners' in options) ? options.checkJoiners : false;
		var useSTD3ASCIIRules = ('useSTD3ASCIIRules' in options) ? options.useSTD3ASCIIRules : false;
		var transitionalProcessing = ('transitionalProcessing' in options) ? options.transitionalProcessing : false;
		var isBidi = ('isBidi' in options) ? options.isBidi : false;

		// "must be satisfied for a non-empty label"
		if (label.length === 0) {
			return true;
		}

		// "1. The label must be in Unicode Normalization Form NFC."
		if (label.normalize("NFC") !== label) {
			return false;
		}

		var codePoints = Array.from(label);

		// "2. If CheckHyphens, the label must not contain a U+002D HYPHEN-MINUS character in both the
		// third and fourth positions."
		//
		// "3. If CheckHyphens, the label must neither begin nor end with a U+002D HYPHEN-MINUS character."
		if (checkHyphens) {
			if ((codePoints[2] === "-" && codePoints[3] === "-") ||
				(label.startsWith("-") || label.endsWith("-"))) {
				return false;
			}
		}

		// "4. If not CheckHyphens, the label must not begin with “xn--”."
		// Disabled while we figure out https://github.com/whatwg/url/issues/803.
		// if (!checkHyphens) {
		//   if (label.startsWith("xn--")) {
		//     return false;
		//   }
		// }

		// "5. The label must not contain a U+002E ( . ) FULL STOP."
		if (label.includes(".")) {
			return false;
		}

		// "6. The label must not begin with a combining mark, that is: General_Category=Mark."
		if (_tr46_combiningMarks.test(codePoints[0])) {
			return false;
		}

		// "7. Each code point in the label must only have certain Status values according to Section 5"
		var chars = Array.from(codePoints);
		for (var index = 0; index < chars.length; index++) {
			var status = tr46_findStatus(ch.codePointAt(0), { useSTD3ASCIIRules: useSTD3ASCIIRules })[0];
			if (transitionalProcessing) {
				// "For Transitional Processing (deprecated), each value must be valid."
				if (status !== _tr46_STATUS_MAPPING.valid) {
					return false;
				}
			} else if (status !== _tr46_STATUS_MAPPING.valid && status !== _tr46_STATUS_MAPPING.deviation) {
				// "For Nontransitional Processing, each value must be either valid or deviation."
				return false;
			}
		}

		// "8. If CheckJoiners, the label must satisify the ContextJ rules"
		// https://tools.ietf.org/html/rfc5892#appendix-A
		if (checkJoiners) {
			var last = 0;
			var entries = Array.from(codePoints.entries());
			for (var index2 = 0; index2 < entries.length; index2++) {
				var entry = entries[index2];
				var i = entry[0];
				var ch = entry[1];
				if (ch === "\u200C" || ch === "\u200D") {
					if (i > 0) {
						if (_tr46_combiningClassVirama.test(codePoints[i - 1])) {
							continue;
						}
						if (ch === "\u200C") {
							// TODO: make this more efficient
							var next = codePoints.indexOf("\u200C", i + 1);
							var test = next < 0 ? codePoints.slice(last) : codePoints.slice(last, next);
							if (_tr46_validZWNJ.test(test.join(""))) {
								last = i + 1;
								continue;
							}
						}
					}
					return false;
				}
			}
		}

		// "9. If CheckBidi, and if the domain name is a Bidi domain name, then the label must satisfy..."
		// https://tools.ietf.org/html/rfc5893#section-2
		if (checkBidi && isBidi) {
			var rtl;

			// 1
			if (_tr46_bidiS1LTR.test(codePoints[0])) {
				rtl = false;
			} else if (_tr46_bidiS1RTL.test(codePoints[0])) {
				rtl = true;
			} else {
				return false;
			}

			if (rtl) {
				// 2-4
				if (!_tr46_bidiS2.test(label) ||
					!_tr46_bidiS3.test(label) ||
					(_tr46_bidiS4EN.test(label) && _tr46_bidiS4AN.test(label))) {
					return false;
				}
			} else if (!_tr46_bidiS5.test(label) ||
				!_tr46_bidiS6.test(label)) { // 5-6
				return false;
			}
		}

		return true;
	}

	function tr46_isBidiDomain(labels) {
		var domain = labels.map(function (label) {
			if (label.startsWith("xn--")) {
				try {
					return punycode_decode(label.substring(4));
				} catch (err) {
					return "";
				}
			}
			return label;
		}).join(".");
		return _tr46_bidiDomain.test(domain);
	}

	function tr46_processing(domainName, options) {
		// 1. Map.
		var string = tr46_mapChars(domainName, options);

		// 2. Normalize.
		string = string.normalize("NFC");

		// 3. Break.
		var labels = string.split(".");
		var isBidi = tr46_isBidiDomain(labels);

		// 4. Convert/Validate.
		var error = false;
		var entries = Array.from(labels.entries());

		for (var index = 0; index < entries.length; index++) {
			var entry = entries[index];
			var i = entry[0];
			var origLabel = entry[1];

			var label = origLabel;
			var transitionalProcessingForThisLabel = options.transitionalProcessing;
			if (label.startsWith("xn--")) {
				if (tr46_containsNonASCII(label)) {
					error = true;
					continue;
				}

				try {
					label = punycode_decode(label.substring(4));
				} catch (_) {
					if (!options.ignoreInvalidPunycode) {
						error = true;
						continue;
					}
				}
				labels[i] = label;
				transitionalProcessingForThisLabel = false;
			}

			// No need to validate if we already know there is an error.
			if (error) {
				continue;
			}

			var validationOptions = {};
			for (var key in options) {
				if (Object.prototype.hasOwnProperty.call(options, key)) {
					validationOptions[key] = options[key];
				}
			}

			validationOptions.transitionalProcessing = transitionalProcessingForThisLabel;
			validationOptions.isBidi = isBidi;

			var validation = tr46_validateLabel(label, validationOptions);
			if (!validation) {
				error = true;
			}
		}

		return {
			string: labels.join("."),
			error: error
		};
	}

	function toASCII(domainName, options) {
		if (typeof options === 'undefined') options = {};

		var checkHyphens = ('checkHyphens' in options) ? options.checkHyphens : false;
		var checkBidi = ('checkBidi' in options) ? options.checkBidi : false;
		var checkJoiners = ('checkJoiners' in options) ? options.checkJoiners : false;
		var useSTD3ASCIIRules = ('useSTD3ASCIIRules' in options) ? options.useSTD3ASCIIRules : false;
		var verifyDNSLength = ('verifyDNSLength' in options) ? options.verifyDNSLength : false;
		var transitionalProcessing = ('transitionalProcessing' in options) ? options.transitionalProcessing : false;
		var ignoreInvalidPunycode = ('ignoreInvalidPunycode' in options) ? options.ignoreInvalidPunycode : false;

		var result = tr46_processing(domainName, {
			checkHyphens: checkHyphens,
			checkBidi: checkBidi,
			checkJoiners: checkJoiners,
			useSTD3ASCIIRules: useSTD3ASCIIRules,
			transitionalProcessing: transitionalProcessing,
			ignoreInvalidPunycode: ignoreInvalidPunycode
		});

		var labels = result.string.split(".");
		labels = labels.map(function (l) {
			if (tr46_containsNonASCII(l)) {
				try {
					return 'xn--' + punycode_encode(l);
				} catch (_) {
					result.error = true;
				}
			}
			return l;
		});

		if (verifyDNSLength) {
			var total = labels.join(".").length;
			if (total > 253 || total === 0) {
				result.error = true;
			}

			for (var i = 0; i < labels.length; ++i) {
				if (labels[i].length > 63 || labels[i].length === 0) {
					result.error = true;
					break;
				}
			}
		}

		if (result.error) {
			return null;
		}
		return labels.join(".");
	}

	function toUnicode(domainName, options) {
		if (typeof options === 'undefined') options = {};

		var checkHyphens = ('checkHyphens' in options) ? options.checkHyphens : false;
		var checkBidi = ('checkBidi' in options) ? options.checkBidi : false;
		var checkJoiners = ('checkJoiners' in options) ? options.checkJoiners : false;
		var useSTD3ASCIIRules = ('useSTD3ASCIIRules' in options) ? options.useSTD3ASCIIRules : false;
		var transitionalProcessing = ('transitionalProcessing' in options) ? options.transitionalProcessing : false;
		var ignoreInvalidPunycode = ('ignoreInvalidPunycode' in options) ? options.ignoreInvalidPunycode : false;

		var result = tr46_processing(domainName, {
			checkHyphens: checkHyphens,
			checkBidi: checkBidi,
			checkJoiners: checkJoiners,
			useSTD3ASCIIRules: useSTD3ASCIIRules,
			transitionalProcessing: transitionalProcessing,
			ignoreInvalidPunycode: ignoreInvalidPunycode
		});

		return {
			domain: result.string,
			error: result.error
		};
	}

	var utf8Encoder = new TextEncoder();
	var utf8Decoder = new TextDecoder("utf-8", { ignoreBOM: true });

	function utf8Encode(string) {
		return utf8Encoder.encode(string);
	}

	function utf8DecodeWithoutBOM(bytes) {
		return utf8Decoder.decode(bytes);
	}

	function isASCIIDigit(c) {
		return c >= 0x30 && c <= 0x39;
	}

	function isASCIIAlpha(c) {
		return (c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A);
	}

	function isASCIIAlphanumeric(c) {
		return isASCIIAlpha(c) || isASCIIDigit(c);
	}

	function isASCIIHex(c) {
		return isASCIIDigit(c) || (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66);
	}

	function p(char) {
		return char.codePointAt(0);
	}

	// https://url.spec.whatwg.org/#percent-encode
	function percentEncode(c) {
		var hex = c.toString(16).toUpperCase();
		if (hex.length === 1) {
			hex = '0' + hex;
		}

		return '%' + hex;
	}

	// https://url.spec.whatwg.org/#percent-decode
	function percentDecodeBytes(input) {
		var output = new Uint8Array(input.byteLength);
		var outputIndex = 0;
		for (var i = 0; i < input.byteLength; ++i) {
			var byte = input[i];
			if (byte !== 0x25) {
				output[outputIndex++] = byte;
			} else if (byte === 0x25 && (!isASCIIHex(input[i + 1]) || !isASCIIHex(input[i + 2]))) {
				output[outputIndex++] = byte;
			} else {
				output[outputIndex++] = parseInt(String.fromCodePoint(input[i + 1], input[i + 2]), 16);
				i += 2;
			}
		}

		return output.slice(0, outputIndex);
	}

	// https://url.spec.whatwg.org/#string-percent-decode
	function percentDecodeString(input) {
		var bytes_1 = utf8Encode(input);
		return percentDecodeBytes(bytes_1);
	}

	// https://url.spec.whatwg.org/#c0-control-percent-encode-set
	function isC0ControlPercentEncode(c) {
		return c <= 0x1F || c > 0x7E;
	}

	// https://url.spec.whatwg.org/#fragment-percent-encode-set
	var extraFragmentPercentEncodeSet = [p(" "), p("\""), p("<"), p(">"), p("`")];
	function isFragmentPercentEncode(c) {
		return isC0ControlPercentEncode(c) || extraFragmentPercentEncodeSet.includes(c);
	}

	// https://url.spec.whatwg.org/#query-percent-encode-set
	var extraQueryPercentEncodeSet = [p(" "), p("\""), p("#"), p("<"), p(">")];
	function isQueryPercentEncode(c) {
		return isC0ControlPercentEncode(c) || extraQueryPercentEncodeSet.includes(c);
	}

	// https://url.spec.whatwg.org/#special-query-percent-encode-set
	function isSpecialQueryPercentEncode(c) {
		return isQueryPercentEncode(c) || c === p("'");
	}

	// https://url.spec.whatwg.org/#path-percent-encode-set
	var extraPathPercentEncodeSet = [p("?"), p("`"), p("{"), p("}")];
	function isPathPercentEncode(c) {
		return isQueryPercentEncode(c) || extraPathPercentEncodeSet.includes(c);
	}

	// https://url.spec.whatwg.org/#userinfo-percent-encode-set
	var extraUserinfoPercentEncodeSet = [p("/"), p(":"), p(";"), p("="), p("@"), p("["), p("\\"), p("]"), p("^"), p("|")];
	function isUserinfoPercentEncode(c) {
		return isPathPercentEncode(c) || extraUserinfoPercentEncodeSet.includes(c);
	}

	// https://url.spec.whatwg.org/#component-percent-encode-set
	var extraComponentPercentEncodeSet = [p("$"), p("%"), p("&"), p("+"), p(",")];
	function isComponentPercentEncode(c) {
		return isUserinfoPercentEncode(c) || extraComponentPercentEncodeSet.includes(c);
	}

	// https://url.spec.whatwg.org/#application-x-www-form-urlencoded-percent-encode-set
	var extraURLEncodedPercentEncodeSet = [p("!"), p("'"), p("("), p(")"), p("~")];
	function isURLEncodedPercentEncode(c) {
		return isComponentPercentEncode(c) || extraURLEncodedPercentEncodeSet.includes(c);
	}

	// https://url.spec.whatwg.org/#code-point-percent-encode-after-encoding
	// https://url.spec.whatwg.org/#utf-8-percent-encode
	// Assuming encoding is always utf-8 allows us to trim one of the logic branches. TODO: support encoding.
	// The "-Internal" variant here has code points as JS strings. The external version used by other files has code points
	// as JS numbers, like the rest of the codebase.
	function utf8PercentEncodeCodePointInternal(codePoint, percentEncodePredicate) {
		var bytes = utf8Encode(codePoint);
		var output = "";

		for (var i = 0; i < bytes.length; i++) {
			var byte = bytes[i];

			// Our percentEncodePredicate operates on bytes, not code points, so this is slightly different from the spec.
			if (!percentEncodePredicate(byte)) {
				output += String.fromCharCode(byte);
			} else {
				output += percentEncode(byte);
			}
		}

		return output;
	}

	function utf8PercentEncodeCodePoint(codePoint, percentEncodePredicate) {
		return utf8PercentEncodeCodePointInternal(String.fromCodePoint(codePoint), percentEncodePredicate);
	}

	// https://url.spec.whatwg.org/#string-percent-encode-after-encoding
	// https://url.spec.whatwg.org/#string-utf-8-percent-encode
	function utf8PercentEncodeString(input, percentEncodePredicate, spaceAsPlus) {
		if (typeof spaceAsPlus === 'undefined') spaceAsPlus = false;

		var output = "";

		var codePoints = Array.from(input);
		for (var i = 0; i < codePoints.length; i++) {
			var codePoint = codePoints[i];
			if (spaceAsPlus && codePoint === " ") {
				output += "+";
			} else {
				output += utf8PercentEncodeCodePointInternal(codePoint, percentEncodePredicate);
			}
		}

		return output;
	}

	function conversions_DOMString (value) {
		if (typeof value === "symbol") {
			throw new TypeError("is a symbol, which cannot be converted to a string");
		}

		return global.String(value);
	};

	function conversions_USVString(value) {
		var S = conversions_DOMString(value);
		var n = S.length;
		var U = [];
		for (var i = 0; i < n; ++i) {
			var c = S.charCodeAt(i);
			if (c < 0xD800 || c > 0xDFFF) {
				U.push(String.fromCodePoint(c));
			} else if (0xDC00 <= c && c <= 0xDFFF) {
				U.push(String.fromCodePoint(0xFFFD));
			} else if (i === n - 1) {
				U.push(String.fromCodePoint(0xFFFD));
			} else {
				var d = S.charCodeAt(i + 1);
				if (0xDC00 <= d && d <= 0xDFFF) {
					var a = c & 0x3FF;
					var b = d & 0x3FF;
					U.push(String.fromCodePoint((2 << 15) + ((2 << 9) * a) + b));
					++i;
				} else {
					U.push(String.fromCodePoint(0xFFFD));
				}
			}
		}

		return U.join("");
	};

	// https://url.spec.whatwg.org/#concept-urlencoded-parser
	function parseUrlencoded(input) {
		var sequences = strictlySplitByteSequence(input, p("&"));
		var output = [];

		for (var i = 0; i < sequences.length; i++) {
			var bytes = sequences[i];
			if (bytes.length === 0) {
				continue;
			}

			var name, value;
			var indexOfEqual = bytes.indexOf(p("="));

			if (indexOfEqual >= 0) {
				name = bytes.slice(0, indexOfEqual);
				value = bytes.slice(indexOfEqual + 1);
			} else {
				name = bytes;
				value = new Uint8Array(0);
			}

			name = replaceByteInByteSequence(name, 0x2B, 0x20);
			value = replaceByteInByteSequence(value, 0x2B, 0x20);

			output.push([
				utf8DecodeWithoutBOM(percentDecodeBytes(name)),
				utf8DecodeWithoutBOM(percentDecodeBytes(value))
			]);
		}
		return output;
	}

	// https://url.spec.whatwg.org/#concept-urlencoded-string-parser
	function parseUrlencodedString(input) {
		return parseUrlencoded(utf8Encode(input));
	}

	// https://url.spec.whatwg.org/#concept-urlencoded-serializer
	function serializeUrlencoded(tuples, encodingOverride) {
		var encoding = "utf-8";
		if (typeof encodingOverride !== 'undefined') {
			// TODO "get the output encoding", i.e. handle encoding labels vs. names.
			encoding = encodingOverride;
		}

		var output = "";
		var entries = Array.from(tuples.entries());

		for (var index = 0; index < entries.length; index++) {
			var entry = entries[index];
			var i = entry[0];
			var tuple = entry[1];

			// TODO: handle encoding override
			var name = utf8PercentEncodeString(tuple[0], isURLEncodedPercentEncode, true);

			var value = tuple[1];
			if (tuple.length > 2 && tuple[2] !== undefined) {
				if (tuple[2] === "hidden" && name === "_charset_") {
					value = encoding;
				} else if (tuple[2] === "file") {
					// value is a File object
					value = value.name;
				}
			}

			value = utf8PercentEncodeString(value, isURLEncodedPercentEncode, true);

			if (i !== 0) {
				output += "&";
			}
			output += ('' + name + value);
		}
		return output;
	}

	function strictlySplitByteSequence(buf, cp) {
		var list = [];
		var last = 0;
		var i = buf.indexOf(cp);
		while (i >= 0) {
			list.push(buf.slice(last, i));
			last = i + 1;
			i = buf.indexOf(cp, last);
		}
		if (last !== buf.length) {
			list.push(buf.slice(last));
		}
		return list;
	}

	function replaceByteInByteSequence(buf, from, to) {
		var i = buf.indexOf(from);
		while (i >= 0) {
			buf[i] = to;
			i = buf.indexOf(from, i + 1);
		}
		return buf;
	}

	var specialSchemes = {
		ftp: 21,
		file: null,
		http: 80,
		https: 443,
		ws: 80,
		wss: 443
	};

	var failure = Symbol("failure");

	function countSymbols(str) {
		return Array.from(str).length;
	}

	function at(input, idx) {
		var c = input[idx];
		return isNaN(c) ? undefined : String.fromCodePoint(c);
	}

	function isSingleDot(buffer) {
		return buffer === "." || buffer.toLowerCase() === "%2e";
	}

	function isDoubleDot(buffer) {
		buffer = buffer.toLowerCase();
		return buffer === ".." || buffer === "%2e." || buffer === ".%2e" || buffer === "%2e%2e";
	}

	function isWindowsDriveLetterCodePoints(cp1, cp2) {
		return isASCIIAlpha(cp1) && (cp2 === p(":") || cp2 === p("|"));
	}

	function isWindowsDriveLetterString(string) {
		return string.length === 2 && isASCIIAlpha(string.codePointAt(0)) && (string[1] === ":" || string[1] === "|");
	}

	function isNormalizedWindowsDriveLetterString(string) {
		return string.length === 2 && isASCIIAlpha(string.codePointAt(0)) && string[1] === ":";
	}

	function containsForbiddenHostCodePoint(string) {
		return string.search(/\0|\t|\n|\r| |#|\/|:|<|>|\?|@|\[|\\|\]|\^|\|/) !== -1;
	}
	function containsForbiddenDomainCodePoint(string) {
		return containsForbiddenHostCodePoint(string) || string.search(/[\0-\x1F]|%|\x7F/) !== -1;
	}

	function isSpecialScheme(scheme) {
		return specialSchemes[scheme] !== undefined;
	}

	function isSpecial(url) {
		return isSpecialScheme(url.scheme);
	}

	function isNotSpecial(url) {
		return !isSpecialScheme(url.scheme);
	}

	function defaultPort(scheme) {
		return specialSchemes[scheme];
	}

	function parseIPv4Number(input) {
		if (input === "") {
			return failure;
		}
		var R = 10;
		if (input.length >= 2 && input.charAt(0) === "0" && input.charAt(1).toLowerCase() === "x") {
			input = input.substring(2);
			R = 16;
		} else if (input.length >= 2 && input.charAt(0) === "0") {
			input = input.substring(1);
			R = 8;
		}
		if (input === "") {
			return 0;
		}
		var regex = /(?:[\0-\/8-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
		if (R === 10) {
			regex = /(?:[\0-\/:-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
		}
		if (R === 16) {
			regex = /(?:[\0-\/:-@G-`g-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
		}
		if (regex.test(input)) {
			return failure;
		}
		return parseInt(input, R);
	}

	function parseIPv4(input) {
		var parts = input.split(".");
		if (parts[parts.length - 1] === "") {
			if (parts.length > 1) {
				parts.pop();
			}
		}

		if (parts.length > 4) {
			return failure;
		}

		var numbers = [];
		for (var i = 0; i < parts.length; i++) {
			var part = parts[i];
			var n = parseIPv4Number(part);
			if (n === failure) {
				return failure;
			}

			numbers.push(n);
		}

		for (var i2 = 0; i2 < numbers.length - 1; ++i2) {
			if (numbers[i2] > 255) {
				return failure;
			}
		}

		if (numbers[numbers.length - 1] >= Math.pow(256, (5 - numbers.length))) {
			return failure;
		}

		var ipv4 = numbers.pop();
		var counter = 0;

		for (var i3 = 0; i3 < numbers.length - 1; ++i3) {
			var n3 = numbers[i3];
			ipv4 += n3 * Math.pow(256, (3 - counter));
			++counter;
		}

		return ipv4;
	}

	function serializeIPv4(address) {
		var output = "";
		var n = address;

		for (var i = 1; i <= 4; ++i) {
			output = String(n % 256) + output;
			if (i !== 4) {
				output = '.' + output;
			}
			n = Math.floor(n / 256);
		}

		return output;
	}

	function parseIPv6(input) {
		var address = [0, 0, 0, 0, 0, 0, 0, 0];
		var pieceIndex = 0;
		var compress = null;
		var pointer = 0;

		input = Array.from(input, function (c) { return c.codePointAt(0) });

		if (input[pointer] === p(":")) {
			if (input[pointer + 1] !== p(":")) {
				return failure;
			}

			pointer += 2;
			++pieceIndex;
			compress = pieceIndex;
		}

		while (pointer < input.length) {
			if (pieceIndex === 8) {
				return failure;
			}

			if (input[pointer] === p(":")) {
				if (compress !== null) {
					return failure;
				}
				++pointer;
				++pieceIndex;
				compress = pieceIndex;
				continue;
			}

			var value = 0;
			var length = 0;

			while (length < 4 && isASCIIHex(input[pointer])) {
				value = value * 0x10 + parseInt(at(input, pointer), 16);
				++pointer;
				++length;
			}

			if (input[pointer] === p(".")) {
				if (length === 0) {
					return failure;
				}

				pointer -= length;

				if (pieceIndex > 6) {
					return failure;
				}

				var numbersSeen = 0;

				while (input[pointer] !== undefined) {
					var ipv4Piece = null;

					if (numbersSeen > 0) {
						if (input[pointer] === p(".") && numbersSeen < 4) {
							++pointer;
						} else {
							return failure;
						}
					}

					if (!isASCIIDigit(input[pointer])) {
						return failure;
					}

					while (isASCIIDigit(input[pointer])) {
						var number = parseInt(at(input, pointer), 10);
						if (ipv4Piece === null) {
							ipv4Piece = number;
						} else if (ipv4Piece === 0) {
							return failure;
						} else {
							ipv4Piece = ipv4Piece * 10 + number;
						}
						if (ipv4Piece > 255) {
							return failure;
						}
						++pointer;
					}

					address[pieceIndex] = address[pieceIndex] * 0x100 + ipv4Piece;

					++numbersSeen;

					if (numbersSeen === 2 || numbersSeen === 4) {
						++pieceIndex;
					}
				}

				if (numbersSeen !== 4) {
					return failure;
				}

				break;
			} else if (input[pointer] === p(":")) {
				++pointer;
				if (input[pointer] === undefined) {
					return failure;
				}
			} else if (input[pointer] !== undefined) {
				return failure;
			}

			address[pieceIndex] = value;
			++pieceIndex;
		}

		if (compress !== null) {
			var swaps = pieceIndex - compress;
			pieceIndex = 7;
			while (pieceIndex !== 0 && swaps > 0) {
				var temp = address[compress + swaps - 1];
				address[compress + swaps - 1] = address[pieceIndex];
				address[pieceIndex] = temp;
				--pieceIndex;
				--swaps;
			}
		} else if (compress === null && pieceIndex !== 8) {
			return failure;
		}

		return address;
	}

	function serializeIPv6(address) {
		var output = "";
		var compress = findTheIPv6AddressCompressedPieceIndex(address);
		var ignore0 = false;

		for (var pieceIndex = 0; pieceIndex <= 7; ++pieceIndex) {
			if (ignore0 && address[pieceIndex] === 0) {
				continue;
			} else if (ignore0) {
				ignore0 = false;
			}

			if (compress === pieceIndex) {
				var separator = pieceIndex === 0 ? "::" : ":";
				output += separator;
				ignore0 = true;
				continue;
			}

			output += address[pieceIndex].toString(16);

			if (pieceIndex !== 7) {
				output += ":";
			}
		}

		return output;
	}

	function parseHost(input, isOpaque) {
		if (input[0] === "[") {
			if (input[input.length - 1] !== "]") {
				return failure;
			}

			return parseIPv6(input.substring(1, input.length - 1));
		}

		if (isOpaque) {
			return parseOpaqueHost(input);
		}

		var domain = utf8DecodeWithoutBOM(percentDecodeString(input));
		var asciiDomain = domainToASCII(domain);
		if (asciiDomain === failure) {
			return failure;
		}

		if (containsForbiddenDomainCodePoint(asciiDomain)) {
			return failure;
		}

		if (endsInANumber(asciiDomain)) {
			return parseIPv4(asciiDomain);
		}

		return asciiDomain;
	}

	function endsInANumber(input) {
		var parts = input.split(".");
		if (parts[parts.length - 1] === "") {
			if (parts.length === 1) {
				return false;
			}
			parts.pop();
		}
		var last = parts[parts.length - 1];
		if (parseIPv4Number(last) !== failure) {
			return true;
		}
		if (/^[0-9]+$/.test(last)) {
			return true;
		}
		return false;
	}

	function parseOpaqueHost(input) {
		if (containsForbiddenHostCodePoint(input)) {
			return failure;
		}

		return utf8PercentEncodeString(input, isC0ControlPercentEncode);
	}

	function findTheIPv6AddressCompressedPieceIndex(address) {
		var longestIndex = null;
		var longestSize = 1; // only find elements > 1
		var foundIndex = null;
		var foundSize = 0;

		for (var pieceIndex = 0; pieceIndex < address.length; ++pieceIndex) {
			if (address[pieceIndex] !== 0) {
				if (foundSize > longestSize) {
					longestIndex = foundIndex;
					longestSize = foundSize;
				}

				foundIndex = null;
				foundSize = 0;
			} else {
				if (foundIndex === null) {
					foundIndex = pieceIndex;
				}
				++foundSize;
			}
		}

		if (foundSize > longestSize) {
			return foundIndex;
		}

		return longestIndex;
	}

	function serializeHost(host) {
		if (typeof host === "number") {
			return serializeIPv4(host);
		}

		// IPv6 serializer
		if (host instanceof Array) {
			return '[' + serializeIPv6(host) + ']';
		}

		return host;
	}

	function domainToASCII(domain, beStrict) {
		var result = toASCII(domain, {
			checkBidi: true,
			checkHyphens: false,
			checkJoiners: true,
			useSTD3ASCIIRules: Boolean(beStrict),
			verifyDNSLength: Boolean(beStrict)
		});
		if (result === null || result === "") {
			return failure;
		}
		return result;
	}

	function trimControlChars(url) {
		return url.replace(/^[\0- ]+|[\0- ]+$/g, "");
	}

	function trimTabAndNewline(url) {
		return url.replace(/\t|\n|\r/g, "");
	}

	function shortenPath(url) {
		var path = url.path;
		if (path.length === 0) {
			return;
		}
		if (url.scheme === "file" && path.length === 1 && isNormalizedWindowsDriveLetter(path[0])) {
			return;
		}
		path.pop();
	}

	function includesCredentials(url) {
		return url.username !== "" || url.password !== "";
	}

	function cannotHaveAUsernamePasswordPort(url) {
		return url.host === null || url.host === "" || url.scheme === "file";
	}

	function hasAnOpaquePath(url) {
		return typeof url.path === "string";
	}

	function isNormalizedWindowsDriveLetter(string) {
		return /^[A-Za-z]:$/.test(string);
	}

	function URLStateMachine(input, base, encodingOverride, url, stateOverride) {
		this.pointer = 0;
		this.input = input;
		this.base = base || null;
		this.encodingOverride = encodingOverride || "utf-8";
		this.stateOverride = stateOverride;
		this.url = url;
		this.failure = false;
		this.parseError = false;
		if (!this.url) {
			this.url = {
				scheme: "",
				username: "",
				password: "",
				host: null,
				port: null,
				path: [],
				query: null,
				fragment: null
			};
			var _res = trimControlChars(this.input);
			if (_res !== this.input) {
				this.parseError = true;
			}
			this.input = _res;
		}
		var res = trimTabAndNewline(this.input);
		if (res !== this.input) {
			this.parseError = true;
		}
		this.input = res;
		this.state = stateOverride || "scheme start";
		this.buffer = "";
		this.atFlag = false;
		this.arrFlag = false;
		this.passwordTokenSeenFlag = false;
		this.input = Array.from(this.input, function (c) {
			return c.codePointAt(0);
		});
		for (; this.pointer <= this.input.length; ++this.pointer) {
			var c = this.input[this.pointer];
			var cStr = isNaN(c) ? undefined : String.fromCodePoint(c);

			// exec state machine
			var ret = this["parse ".concat(this.state)](c, cStr);
			if (!ret) {
				break; // terminate algorithm
			} else if (ret === failure) {
				this.failure = true;
				break;
			}
		}
	}

	URLStateMachine.prototype["parse scheme start"] = function parseSchemeStart(c, cStr) {
		if (isASCIIAlpha(c)) {
			this.buffer += cStr.toLowerCase();
			this.state = "scheme";
		} else if (!this.stateOverride) {
			this.state = "no scheme";
			--this.pointer;
		} else {
			this.parseError = true;
			return failure;
		}
		return true;
	};

	URLStateMachine.prototype["parse scheme"] = function parseScheme(c, cStr) {
		if (isASCIIAlphanumeric(c) || c === p("+") || c === p("-") || c === p(".")) {
			this.buffer += cStr.toLowerCase();
		} else if (c === p(":")) {
			if (this.stateOverride) {
				if (isSpecial(this.url) && !isSpecialScheme(this.buffer)) {
					return false;
				}
				if (!isSpecial(this.url) && isSpecialScheme(this.buffer)) {
					return false;
				}
				if ((includesCredentials(this.url) || this.url.port !== null) && this.buffer === "file") {
					return false;
				}
				if (this.url.scheme === "file" && this.url.host === "") {
					return false;
				}
			}
			this.url.scheme = this.buffer;
			if (this.stateOverride) {
				if (this.url.port === defaultPort(this.url.scheme)) {
					this.url.port = null;
				}
				return false;
			}
			this.buffer = "";
			if (this.url.scheme === "file") {
				if (this.input[this.pointer + 1] !== p("/") || this.input[this.pointer + 2] !== p("/")) {
					this.parseError = true;
				}
				this.state = "file";
			} else if (isSpecial(this.url) && this.base !== null && this.base.scheme === this.url.scheme) {
				this.state = "special relative or authority";
			} else if (isSpecial(this.url)) {
				this.state = "special authority slashes";
			} else if (this.input[this.pointer + 1] === p("/")) {
				this.state = "path or authority";
				++this.pointer;
			} else {
				this.url.path = "";
				this.state = "opaque path";
			}
		} else if (!this.stateOverride) {
			this.buffer = "";
			this.state = "no scheme";
			this.pointer = -1;
		} else {
			this.parseError = true;
			return failure;
		}
		return true;
	};

	URLStateMachine.prototype["parse no scheme"] = function parseNoScheme(c) {
		if (this.base === null || hasAnOpaquePath(this.base) && c !== p("#")) {
			return failure;
		} else if (hasAnOpaquePath(this.base) && c === p("#")) {
			this.url.scheme = this.base.scheme;
			this.url.path = this.base.path;
			this.url.query = this.base.query;
			this.url.fragment = "";
			this.state = "fragment";
		} else if (this.base.scheme === "file") {
			this.state = "file";
			--this.pointer;
		} else {
			this.state = "relative";
			--this.pointer;
		}
		return true;
	};

	URLStateMachine.prototype["parse special relative or authority"] = function parseSpecialRelativeOrAuthority(c) {
		if (c === p("/") && this.input[this.pointer + 1] === p("/")) {
			this.state = "special authority ignore slashes";
			++this.pointer;
		} else {
			this.parseError = true;
			this.state = "relative";
			--this.pointer;
		}
		return true;
	};

	URLStateMachine.prototype["parse path or authority"] = function parsePathOrAuthority(c) {
		if (c === p("/")) {
			this.state = "authority";
		} else {
			this.state = "path";
			--this.pointer;
		}
		return true;
	};

	URLStateMachine.prototype["parse relative"] = function parseRelative(c) {
		this.url.scheme = this.base.scheme;
		if (c === p("/")) {
			this.state = "relative slash";
		} else if (isSpecial(this.url) && c === p("\\")) {
			this.parseError = true;
			this.state = "relative slash";
		} else {
			this.url.username = this.base.username;
			this.url.password = this.base.password;
			this.url.host = this.base.host;
			this.url.port = this.base.port;
			this.url.path = this.base.path.slice();
			this.url.query = this.base.query;
			if (c === p("?")) {
				this.url.query = "";
				this.state = "query";
			} else if (c === p("#")) {
				this.url.fragment = "";
				this.state = "fragment";
			} else if (!isNaN(c)) {
				this.url.query = null;
				this.url.path.pop();
				this.state = "path";
				--this.pointer;
			}
		}
		return true;
	};

	URLStateMachine.prototype["parse relative slash"] = function parseRelativeSlash(c) {
		if (isSpecial(this.url) && (c === p("/") || c === p("\\"))) {
			if (c === p("\\")) {
				this.parseError = true;
			}
			this.state = "special authority ignore slashes";
		} else if (c === p("/")) {
			this.state = "authority";
		} else {
			this.url.username = this.base.username;
			this.url.password = this.base.password;
			this.url.host = this.base.host;
			this.url.port = this.base.port;
			this.state = "path";
			--this.pointer;
		}
		return true;
	};

	URLStateMachine.prototype["parse special authority slashes"] = function parseSpecialAuthoritySlashes(c) {
		if (c === p("/") && this.input[this.pointer + 1] === p("/")) {
			this.state = "special authority ignore slashes";
			++this.pointer;
		} else {
			this.parseError = true;
			this.state = "special authority ignore slashes";
			--this.pointer;
		}
		return true;
	};

	URLStateMachine.prototype["parse special authority ignore slashes"] = function parseSpecialAuthorityIgnoreSlashes(c) {
		if (c !== p("/") && c !== p("\\")) {
			this.state = "authority";
			--this.pointer;
		} else {
			this.parseError = true;
		}
		return true;
	};

	URLStateMachine.prototype["parse authority"] = function parseAuthority(c, cStr) {
		if (c === p("@")) {
			this.parseError = true;
			if (this.atFlag) {
				this.buffer = "%40".concat(this.buffer);
			}
			this.atFlag = true;

			// careful, this is based on buffer and has its own pointer (this.pointer != pointer) and inner chars
			var len = countSymbols(this.buffer);
			for (var pointer = 0; pointer < len; ++pointer) {
				var codePoint = this.buffer.codePointAt(pointer);
				if (codePoint === p(":") && !this.passwordTokenSeenFlag) {
					this.passwordTokenSeenFlag = true;
					continue;
				}
				var encodedCodePoints = utf8PercentEncodeCodePoint(codePoint, isUserinfoPercentEncode);
				if (this.passwordTokenSeenFlag) {
					this.url.password += encodedCodePoints;
				} else {
					this.url.username += encodedCodePoints;
				}
			}
			this.buffer = "";
		} else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\")) {
			if (this.atFlag && this.buffer === "") {
				this.parseError = true;
				return failure;
			}
			this.pointer -= countSymbols(this.buffer) + 1;
			this.buffer = "";
			this.state = "host";
		} else {
			this.buffer += cStr;
		}
		return true;
	};

	URLStateMachine.prototype["parse hostname"] = URLStateMachine.prototype["parse host"] = function parseHostName(c, cStr) {
		if (this.stateOverride && this.url.scheme === "file") {
			--this.pointer;
			this.state = "file host";
		} else if (c === p(":") && !this.arrFlag) {
			if (this.buffer === "") {
				this.parseError = true;
				return failure;
			}
			if (this.stateOverride === "hostname") {
				return false;
			}
			var host = parseHost(this.buffer, isNotSpecial(this.url));
			if (host === failure) {
				return failure;
			}
			this.url.host = host;
			this.buffer = "";
			this.state = "port";
		} else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\")) {
			--this.pointer;
			if (isSpecial(this.url) && this.buffer === "") {
				this.parseError = true;
				return failure;
			} else if (this.stateOverride && this.buffer === "" && (includesCredentials(this.url) || this.url.port !== null)) {
				this.parseError = true;
				return false;
			}
			var _host = parseHost(this.buffer, isNotSpecial(this.url));
			if (_host === failure) {
				return failure;
			}
			this.url.host = _host;
			this.buffer = "";
			this.state = "path start";
			if (this.stateOverride) {
				return false;
			}
		} else {
			if (c === p("[")) {
				this.arrFlag = true;
			} else if (c === p("]")) {
				this.arrFlag = false;
			}
			this.buffer += cStr;
		}
		return true;
	};

	URLStateMachine.prototype["parse port"] = function parsePort(c, cStr) {
		if (isASCIIDigit(c)) {
			this.buffer += cStr;
		} else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\") || this.stateOverride) {
			if (this.buffer !== "") {
				var port = parseInt(this.buffer, 10);
				if (port > Math.pow(2, 16) - 1) {
					this.parseError = true;
					return failure;
				}
				this.url.port = port === defaultPort(this.url.scheme) ? null : port;
				this.buffer = "";
			}
			if (this.stateOverride) {
				return false;
			}
			this.state = "path start";
			--this.pointer;
		} else {
			this.parseError = true;
			return failure;
		}
		return true;
	};

	var fileOtherwiseCodePoints = [p("/"), p("\\"), p("?"), p("#")];
	function startsWithWindowsDriveLetter(input, pointer) {
		var length = input.length - pointer;
		return length >= 2 && isWindowsDriveLetterCodePoints(input[pointer], input[pointer + 1]) && (length === 2 || fileOtherwiseCodePoints.includes(input[pointer + 2]));
	}

	URLStateMachine.prototype["parse file"] = function parseFile(c) {
		this.url.scheme = "file";
		this.url.host = "";
		if (c === p("/") || c === p("\\")) {
			if (c === p("\\")) {
				this.parseError = true;
			}
			this.state = "file slash";
		} else if (this.base !== null && this.base.scheme === "file") {
			this.url.host = this.base.host;
			this.url.path = this.base.path.slice();
			this.url.query = this.base.query;
			if (c === p("?")) {
				this.url.query = "";
				this.state = "query";
			} else if (c === p("#")) {
				this.url.fragment = "";
				this.state = "fragment";
			} else if (!isNaN(c)) {
				this.url.query = null;
				if (!startsWithWindowsDriveLetter(this.input, this.pointer)) {
					shortenPath(this.url);
				} else {
					this.parseError = true;
					this.url.path = [];
				}
				this.state = "path";
				--this.pointer;
			}
		} else {
			this.state = "path";
			--this.pointer;
		}
		return true;
	};
	URLStateMachine.prototype["parse file slash"] = function parseFileSlash(c) {
		if (c === p("/") || c === p("\\")) {
			if (c === p("\\")) {
				this.parseError = true;
			}
			this.state = "file host";
		} else {
			if (this.base !== null && this.base.scheme === "file") {
				if (!startsWithWindowsDriveLetter(this.input, this.pointer) && isNormalizedWindowsDriveLetterString(this.base.path[0])) {
					this.url.path.push(this.base.path[0]);
				}
				this.url.host = this.base.host;
			}
			this.state = "path";
			--this.pointer;
		}
		return true;
	};
	URLStateMachine.prototype["parse file host"] = function parseFileHost(c, cStr) {
		if (isNaN(c) || c === p("/") || c === p("\\") || c === p("?") || c === p("#")) {
			--this.pointer;
			if (!this.stateOverride && isWindowsDriveLetterString(this.buffer)) {
				this.parseError = true;
				this.state = "path";
			} else if (this.buffer === "") {
				this.url.host = "";
				if (this.stateOverride) {
					return false;
				}
				this.state = "path start";
			} else {
				var host = parseHost(this.buffer, isNotSpecial(this.url));
				if (host === failure) {
					return failure;
				}
				if (host === "localhost") {
					host = "";
				}
				this.url.host = host;
				if (this.stateOverride) {
					return false;
				}
				this.buffer = "";
				this.state = "path start";
			}
		} else {
			this.buffer += cStr;
		}
		return true;
	};
	URLStateMachine.prototype["parse path start"] = function parsePathStart(c) {
		if (isSpecial(this.url)) {
			if (c === p("\\")) {
				this.parseError = true;
			}
			this.state = "path";
			if (c !== p("/") && c !== p("\\")) {
				--this.pointer;
			}
		} else if (!this.stateOverride && c === p("?")) {
			this.url.query = "";
			this.state = "query";
		} else if (!this.stateOverride && c === p("#")) {
			this.url.fragment = "";
			this.state = "fragment";
		} else if (c !== undefined) {
			this.state = "path";
			if (c !== p("/")) {
				--this.pointer;
			}
		} else if (this.stateOverride && this.url.host === null) {
			this.url.path.push("");
		}
		return true;
	};
	URLStateMachine.prototype["parse path"] = function parsePath(c) {
		if (isNaN(c) || c === p("/") || isSpecial(this.url) && c === p("\\") || !this.stateOverride && (c === p("?") || c === p("#"))) {
			if (isSpecial(this.url) && c === p("\\")) {
				this.parseError = true;
			}
			if (isDoubleDot(this.buffer)) {
				shortenPath(this.url);
				if (c !== p("/") && !(isSpecial(this.url) && c === p("\\"))) {
					this.url.path.push("");
				}
			} else if (isSingleDot(this.buffer) && c !== p("/") && !(isSpecial(this.url) && c === p("\\"))) {
				this.url.path.push("");
			} else if (!isSingleDot(this.buffer)) {
				if (this.url.scheme === "file" && this.url.path.length === 0 && isWindowsDriveLetterString(this.buffer)) {
					this.buffer = "".concat(this.buffer[0], ":");
				}
				this.url.path.push(this.buffer);
			}
			this.buffer = "";
			if (c === p("?")) {
				this.url.query = "";
				this.state = "query";
			}
			if (c === p("#")) {
				this.url.fragment = "";
				this.state = "fragment";
			}
		} else {
			// TODO: If c is not a URL code point and not "%", parse error.

			if (c === p("%") && (!isASCIIHex(this.input[this.pointer + 1]) || !isASCIIHex(this.input[this.pointer + 2]))) {
				this.parseError = true;
			}
			this.buffer += utf8PercentEncodeCodePoint(c, isPathPercentEncode);
		}
		return true;
	};
	URLStateMachine.prototype["parse opaque path"] = function parseOpaquePath(c) {
		if (c === p("?")) {
			this.url.query = "";
			this.state = "query";
		} else if (c === p("#")) {
			this.url.fragment = "";
			this.state = "fragment";
		} else {
			// TODO: Add: not a URL code point
			if (!isNaN(c) && c !== p("%")) {
				this.parseError = true;
			}
			if (c === p("%") && (!isASCIIHex(this.input[this.pointer + 1]) || !isASCIIHex(this.input[this.pointer + 2]))) {
				this.parseError = true;
			}
			if (!isNaN(c)) {
				this.url.path += utf8PercentEncodeCodePoint(c, isC0ControlPercentEncode);
			}
		}
		return true;
	};
	URLStateMachine.prototype["parse query"] = function parseQuery(c, cStr) {
		if (!isSpecial(this.url) || this.url.scheme === "ws" || this.url.scheme === "wss") {
			this.encodingOverride = "utf-8";
		}
		if (!this.stateOverride && c === p("#") || isNaN(c)) {
			var queryPercentEncodePredicate = isSpecial(this.url) ? isSpecialQueryPercentEncode : isQueryPercentEncode;
			this.url.query += utf8PercentEncodeString(this.buffer, queryPercentEncodePredicate);
			this.buffer = "";
			if (c === p("#")) {
				this.url.fragment = "";
				this.state = "fragment";
			}
		} else if (!isNaN(c)) {
			// TODO: If c is not a URL code point and not "%", parse error.

			if (c === p("%") && (!isASCIIHex(this.input[this.pointer + 1]) || !isASCIIHex(this.input[this.pointer + 2]))) {
				this.parseError = true;
			}
			this.buffer += cStr;
		}
		return true;
	};

	URLStateMachine.prototype["parse fragment"] = function parseFragment(c) {
		if (!isNaN(c)) {
			// TODO: If c is not a URL code point and not "%", parse error.
			if (c === p("%") && (!isASCIIHex(this.input[this.pointer + 1]) || !isASCIIHex(this.input[this.pointer + 2]))) {
				this.parseError = true;
			}
			this.url.fragment += utf8PercentEncodeCodePoint(c, isFragmentPercentEncode);
		}
		return true;
	};

	function serializeURL(url, excludeFragment) {
		var output = "".concat(url.scheme, ":");
		if (url.host !== null) {
			output += "//";
			if (url.username !== "" || url.password !== "") {
				output += url.username;
				if (url.password !== "") {
					output += ":".concat(url.password);
				}
				output += "@";
			}
			output += serializeHost(url.host);
			if (url.port !== null) {
				output += ":".concat(url.port);
			}
		}
		if (url.host === null && !hasAnOpaquePath(url) && url.path.length > 1 && url.path[0] === "") {
			output += "/.";
		}
		output += serializePath(url);
		if (url.query !== null) {
			output += "?".concat(url.query);
		}
		if (!excludeFragment && url.fragment !== null) {
			output += "#".concat(url.fragment);
		}
		return output;
	}

	function serializeOrigin(tuple) {
		var result = "".concat(tuple.scheme, "://");
		result += serializeHost(tuple.host);
		if (tuple.port !== null) {
			result += ":".concat(tuple.port);
		}
		return result;
	}

	function serializePath(url) {
		if (hasAnOpaquePath(url)) {
			return url.path;
		}

		var output = "";
		for (var i = 0; i < url.path.length; i++) {
			var segment = url.path[i];
			output += ('/' + segment);

		}

		return output;
	}

	function serializeURLOrigin(url) {
		// https://url.spec.whatwg.org/#concept-url-origin
		switch (url.scheme) {
			case "blob":
				{
					var pathURL = parseURL(serializePath(url));
					if (pathURL === null) {
						return "null";
					}
					if (pathURL.scheme !== "http" && pathURL.scheme !== "https") {
						return "null";
					}
					return serializeURLOrigin(pathURL);
				}
			case "ftp":
			case "http":
			case "https":
			case "ws":
			case "wss":
				return serializeOrigin({
					scheme: url.scheme,
					host: url.host,
					port: url.port
				});
			case "file":
				// The spec says:
				// > Unfortunate as it is, this is left as an exercise to the reader. When in doubt, return a new opaque origin.
				// Browsers tested so far:
				// - Chrome says "file://", but treats file: URLs as cross-origin for most (all?) purposes; see e.g.
				//   https://bugs.chromium.org/p/chromium/issues/detail?id=37586
				// - Firefox says "null", but treats file: URLs as same-origin sometimes based on directory stuff; see
				//   https://developer.mozilla.org/en-US/docs/Archive/Misc_top_level/Same-origin_policy_for_file:_URIs
				return "null";
			default:
				// serializing an opaque origin returns "null"
				return "null";
		}
	};

	function basicURLParse(input, options) {
		if (options === undefined) {
			options = {};
		}
		var usm = new URLStateMachine(input, options.baseURL, options.encodingOverride, options.url, options.stateOverride);
		if (usm.failure) {
			return null;
		}
		return usm.url;
	};

	function setTheUsername(url, username) {
		url.username = utf8PercentEncodeString(username, isUserinfoPercentEncode);
	};

	function setThePassword(url, password) {
		url.password = utf8PercentEncodeString(password, isUserinfoPercentEncode);
	};

	function serializeInteger(integer) {
		return String(integer);
	};

	function parseURL(input, options) {
		if (options === undefined) {
			options = {};
		}

		// We don't handle blobs, so this just delegates:
		return basicURLParse(input, {
			baseURL: options.baseURL,
			encodingOverride: options.encodingOverride
		});
	};

	function URLSearchParamsImpl(globalObject, constructorArgs, options) {
		if (typeof options === 'undefined') options = {};
		var doNotStripQMark = options.doNotStripQMark === true;

		var init = constructorArgs[0];
		this._list = [];
		this._url = null;

		if (!doNotStripQMark && typeof init === "string" && init[0] === "?") {
			init = init.slice(1);
		}

		if (Array.isArray(init)) {
			for (var i = 0; i < init.length; i++) {
				var pair = init[i];
				if (pair.length !== 2) {
					throw new TypeError("Failed to construct 'URLSearchParams': parameter 1 sequence's element does not " +
						"contain exactly two elements.");
				}
				this._list.push([pair[0], pair[1]]);
			}
		} else if (typeof init === "object" && Object.getPrototypeOf(init) === null) {
			var initKeys = Object.keys(init);
			for (var i2 = 0; i2 < initKeys.length; i2++) {
				var name = initKeys[i2];
				var value = init[name];
				this._list.push([name, value]);
			}
		} else {
			this._list = parseUrlencodedString(init);
		}
	}

	URLSearchParamsImpl.prototype._updateSteps = function _updateSteps() {
		if (this._url !== null) {
			var serializedQuery = serializeUrlencoded(this._list);
			if (serializedQuery === "") {
				serializedQuery = null;
			}

			this._url._url.query = serializedQuery;

			if (serializedQuery === null) {
				this._url._potentiallyStripTrailingSpacesFromAnOpaquePath();
			}
		}
	}

	Object.defineProperty(URLSearchParamsImpl.prototype, 'size', {
		configurable: true,
		enumerable: false,
		get: function () {
			return this._list.length;
		},
		set: undefined
	});

	URLSearchParamsImpl.prototype.append = function append(name, value) {
		this._list.push([name, value]);
		this._updateSteps();
	}

	URLSearchParamsImpl.prototype.delete = function (name, value) {
		var i = 0;
		while (i < this._list.length) {
			if (this._list[i][0] === name && (value === undefined || this._list[i][1] === value)) {
				this._list.splice(i, 1);
			} else {
				i++;
			}
		}
		this._updateSteps();
	}

	URLSearchParamsImpl.prototype.get = function get(name) {
		for (var i = 0; i < this._list.length; i++) {
			var tuple = this._list[i];
			if (tuple[0] === name) {
				return tuple[1];
			}
		}
		return null;
	}

	URLSearchParamsImpl.prototype.getAll = function gatAll(name) {
		var output = [];
		for (var i = 0; i < this._list.length; i++) {
			var tuple = this._list[i];
			if (tuple[0] === name) {
				output.push(tuple[1]);
			}
		}
		return output;
	}

	URLSearchParamsImpl.prototype.has = function has(name, value) {
		for (var i = 0; i < this._list.length; i++) {
			var tuple = this._list[i];
			if (tuple[0] === name && (value === undefined || tuple[1] === value)) {
				return true;
			}
		}
		return false;
	}

	URLSearchParamsImpl.prototype.set = function set(name, value) {
		var found = false;
		var i = 0;
		while (i < this._list.length) {
			if (this._list[i][0] === name) {
				if (found) {
					this._list.splice(i, 1);
				} else {
					found = true;
					this._list[i][1] = value;
					i++;
				}
			} else {
				i++;
			}
		}
		if (!found) {
			this._list.push([name, value]);
		}
		this._updateSteps();
	}

	URLSearchParamsImpl.prototype.sort = function sort() {
		this._list.sort(function(a, b) {
			if (a[0] < b[0]) {
				return -1;
			}
			if (a[0] > b[0]) {
				return 1;
			}
			return 0;
		});

		this._updateSteps();
	}

	URLSearchParamsImpl.prototype[Symbol.iterator] = function() {
		return this._list[Symbol.iterator]();
	}

	URLSearchParamsImpl.prototype.toString = function toString() {
		return serializeUrlencoded(this._list);
	}

	// Returns "Type(value) is Object" in ES terminology.
	function isObject(value) {
		return (typeof value === "object" && value !== null) || typeof value === "function";
	}

	var URLSearchParams = function URLSearchParams() {
		if (!(this instanceof URLSearchParams)) {
			throw new TypeError("Failed to construct 'URLSearchParams': Please use the 'new' operator, this DOM object constructor cannot be called as a function.");
		}

		var args = [];

		{
			let curArg = arguments[0];
			if (curArg !== undefined) {
				if (utils.isObject(curArg)) {
					if (curArg[Symbol.iterator] !== undefined) {
						if (!utils.isObject(curArg)) {
							throw new globalObject.TypeError(
								"Failed to construct 'URLSearchParams': parameter 1" + " sequence" + " is not an iterable object."
							);
						} else {
							const V = [];
							const tmp = curArg;
							for (let nextItem of tmp) {
								if (!utils.isObject(nextItem)) {
									throw new globalObject.TypeError(
										"Failed to construct 'URLSearchParams': parameter 1" +
										" sequence" +
										"'s element" +
										" is not an iterable object."
									);
								} else {
									const V = [];
									const tmp = nextItem;
									for (let nextItem of tmp) {
										nextItem = conversions_USVString(nextItem, {
											context:
												"Failed to construct 'URLSearchParams': parameter 1" +
												" sequence" +
												"'s element" +
												"'s element",
											globals: globalObject
										});

										V.push(nextItem);
									}
									nextItem = V;
								}

								V.push(nextItem);
							}
							curArg = V;
						}
					} else {
						if (!utils.isObject(curArg)) {
							throw new globalObject.TypeError(
								"Failed to construct 'URLSearchParams': parameter 1" + " record" + " is not an object."
							);
						} else {
							const result = Object.create(null);
							for (const key of Reflect.ownKeys(curArg)) {
								const desc = Object.getOwnPropertyDescriptor(curArg, key);
								if (desc && desc.enumerable) {
									let typedKey = key;

									typedKey = conversions_USVString(typedKey, {
										context: "Failed to construct 'URLSearchParams': parameter 1" + " record" + "'s key",
										globals: globalObject
									});

									let typedValue = curArg[key];

									typedValue = conversions_USVString(typedValue, {
										context: "Failed to construct 'URLSearchParams': parameter 1" + " record" + "'s value",
										globals: globalObject
									});

									result[typedKey] = typedValue;
								}
							}
							curArg = result;
						}
					}
				} else {
					curArg = conversions["USVString"](curArg, {
						context: "Failed to construct 'URLSearchParams': parameter 1",
						globals: globalObject
					});
				}
			} else {
				curArg = "";
			}
			args.push(curArg);
		}
		return exports.setup(Object.create((this instanceof URLSearchParams ? this.constructor : void 0).prototype), globalObject, args);
	}

	// Export the object
	CreateMethodProperty(global, 'URLSearchParams', URLSearchParams);
}(self));
