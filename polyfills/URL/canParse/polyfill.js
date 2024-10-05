/* global ToString */
(function (global) {
	"use strict";
	global.URL.canParse = function canParse(url /* , base */) {
		if (arguments.length < 1) {
			throw new TypeError("Not enough arguments");
		}
		var urlString = ToString(url);
		if (arguments.length < 2 || arguments[1] === undefined) {
			try {
				new URL(urlString);
				return true;
			} catch (ignore) {
				return false;
			}
		} else {
			var base = ToString(arguments[1]);
			try {
				new URL(urlString, base);
				return true;
			} catch (ignore) {
				return false;
			}
		}
	};
})(self);
