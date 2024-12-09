const semver = require('semver');
const uap = require('ua-parser-js');

/**
 * @param {string} ua
 * @returns {import('../../lib/index').UaParser}
 */
function ua_parser(ua) {
	const p = uap(ua);

	return {
		normalize: function normalize() {
			return this.getFamily() + "/" + this.getVersion();
		},
		isUnknown: function isUnknown() {
			return !p.browser.name || !p.browser.version || this.getFamily() === 'other';
		},
		getVersion: function getVersion() {
			if (this.isUnknown()) return '0.0.0';

			if (this.getFamily() === 'ios_saf' && p.os.version) return semver.coerce(p.os.version).toString();

			return semver.coerce(p.browser.version).toString();
		},
		getFamily: function getFamily() {
			switch (p.browser.name) {
				case "Android Browser":
					return "android"
				case "Chrome":
				case "Chrome Mobile":
				case "Chrome Headless":
				case "Chrome WebView":
				case "Chromium":
					return "chrome"
				case "Edge":
					if (semver.satisfies(semver.coerce(p.browser.version), '>= 79')) return 'chrome';

					return "edge";
				case "Firefox":
					return "firefox";
				case "Firefox Mobile":
					return "firefox_mob";
				case "IE":
					return "ie";
				case "IEMobile":
					return "ie_mob";
				case "Safari":
					return "safari";
				case "Mobile Safari":
				case "Safari Mobile":
					return "ios_saf";
				default:
					return "other";
			}
		},
		satisfies: function satisfies(range) {
			return semver.satisfies(this.getVersion(), range);
		}
	}
}

module.exports = ua_parser;
