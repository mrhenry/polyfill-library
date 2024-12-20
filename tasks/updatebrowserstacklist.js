"use strict";

const path = require("node:path");
const fs = require("node:fs");
const BrowserStack = require("browserstack");

const browserStackCredentials = {
	username: process.env.BROWSERSTACK_USERNAME,
	password: process.env.BROWSERSTACK_ACCESS_KEY
};

if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
	throw new Error("BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set in the environment to run this script.");
}

const automateClient = BrowserStack.createAutomateClient(browserStackCredentials);
const TOML = require('@iarna/toml');
const semver = require("semver");
automateClient.getBrowsers(function (error, browsers) {
	browsers.sort((a, b) => {
		if (a.browser !== b.browser) {
			return a.browser.localeCompare(b.browser);
		}

		if (
			(a.browser_version && b.browser_version) &&
			a.browser_version !== b.browser_version
		) {
			return semver.compare(semver.coerce(a.browser_version).toString(), semver.coerce(b.browser_version).toString());
		}

		if (a.os !== b.os) {
			return a.os.localeCompare(b.os);
		}

		if (
			(a.os.toLowerCase() === 'windows' || a.os.toLowerCase() === 'os x') &&
			(a.os_version && b.os_version) &&
			a.os_version !== b.os_version
		) {
			// For desktop:
			// Sort OS versions in reverse order.
			// We want to test only one OS for each browser version.
			// Newest OS first.
			const a_os_version = semver.coerce(a.os_version);
			const b_os_version = semver.coerce(b.os_version)

			if (a_os_version && b_os_version) {
				return semver.compare(b_os_version.toString(), a_os_version.toString());
			}

			return b.os_version.localeCompare(a.os_version);
		} else if (
			(a.os_version && b.os_version) &&
			a.os_version !== b.os_version
		) {
			// For others
			// Sort OS versions regularly
			// We want to test only one OS for each browser version.
			// Newest OS first.
			const a_os_version = semver.coerce(a.os_version);
			const b_os_version = semver.coerce(b.os_version)

			if (a_os_version && b_os_version) {
				return semver.compare(a_os_version.toString(), b_os_version.toString());
			}

			return a.os_version.localeCompare(b.os_version);
		}

		if (a.device !== b.device) {
			return a.device.localeCompare(b.device);
		}

		return 0;
	});

	// Ignore non-Safari browsers on iOS
	browsers = browsers.filter((browser) => {
		if (browser.os === 'ios' && (browser.browser !== 'iphone' && browser.browser !== 'ipad')) {
			return false;
		}

		return true;
	});

	console.log("Updated the browser list for automated testing via BrowserStack.");
	fs.writeFileSync(path.join(__dirname, "../test/polyfills/browserstackBrowsers.toml"), `# This file is automatically generated via \`npm run update-browserstack-list\`
${TOML.stringify({browsers})}`);
	fs.writeFileSync(
		path.join(__dirname, "../test/polyfills/browsers.toml"), `# This file is automatically generated via \`npm run update-browserstack-list\`
${TOML.stringify({
	browsers: ([...new Set(browsers.map(b => (b.browser_version ? `${b.browser}/${b.browser_version}` : `${b.os}/${b.os_version}`)))].sort(sortBrowserByVersion))
})}`);
});

function sortBrowserByVersion(a, b) {
	const [aBrowser, aVersion] = a.split("/");
	const [bBrowser, bVersion] = b.split("/");

	if (aBrowser !== bBrowser) {
		return aBrowser.localeCompare(bBrowser);
	}

	if (aVersion !== bVersion) {
		return semver.lt(semver.coerce(aVersion), semver.coerce(bVersion)) ? -1 : 1;
	}

	return 0;
}
