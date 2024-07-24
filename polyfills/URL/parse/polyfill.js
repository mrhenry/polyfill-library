/* global ToString */
(function (global) {
	"use strict";
	global.URL.parse = function parse(url /* , base */) {
		if (arguments.length < 1) {
			throw new TypeError("Not enough arguments");
		}
		var urlString = ToString(url);
		if (arguments.length < 2 || arguments[1] === undefined) {
			try {
				return new URL(urlString);
			} catch (ignore) {
				return null;
			}
		} else {
			var base = ToString(arguments[1]);
			try {
				return new URL(urlString, base);
			} catch (ignore) {
				return null;
			}
		}
	};
})(self);
