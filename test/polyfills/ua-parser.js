const semver = require('semver');
const uap = require('ua-parser-js');

const SHORT_UA_REGEX = /^(android|bb|chrome|edge|edge_mob|firefox|firefox_mob|ie|ie_mob|safari|ios_saf|opera|op_mob|op_mini|samsung_mob|other)\/((?:\d+\.)*\d+)$/i;

/**
 * @param {string} ua
 * @returns {import('../../lib/index').UaParser}
 */
function ua_parser(ua) {
	if (SHORT_UA_REGEX.test(ua)) {
		const [, family, version] = ua.match(SHORT_UA_REGEX);

		return {
			normalize: function normalize() {
				return this.getFamily() + "/" + this.getVersion();
			},
			isUnknown: function isUnknown() {
				return this.getFamily() === 'other';
			},
			getVersion: function getVersion() {
				return semver.coerce(version).toString();
			},
			getFamily: function getFamily() {
				return family;
			},
			satisfies: function satisfies(range) {
				return semver.satisfies(this.getVersion(), range);
			}
		}
	}

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

			if (p.os.version && this.getFamily() === 'ios_saf') return semver.coerce(p.os.version).toString();

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
				case "Opera":
					return "opera";
				case "Opera Mobi":
					return "op_mob";
				case "Opera Mini":
					return "op_mini";
				case "Safari":
					return "safari";
				case "Mobile Safari":
				case "Safari Mobile":
					return "ios_saf";
				case "Samsung Internet":
					return "samsung_mob"
				default:
					break;
			}

			return "other";
		},
		satisfies: function satisfies(range) {
			return semver.satisfies(this.getVersion(), range);
		}
	}
}

module.exports = ua_parser;
