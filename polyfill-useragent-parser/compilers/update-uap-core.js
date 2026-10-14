"use strict";

const fs = require("node:fs");
const https = require("node:https");
const path = require("node:path");

// Refreshes the vendored upstream ua-parser data: the regex definitions that
// the parser is compiled from, and the test fixtures it is verified against.
// Run with `npm run update-uap-core`, then rebuild with `npm run build`.
const BASE = "https://raw.githubusercontent.com/ua-parser/uap-core/master/";
const PACKAGE_ROOT = path.join(__dirname, "..");

const FILES = [
	["regexes.yaml", "compilers/uap-core-regexes.yaml"],
	["tests/test_ua.yaml", "test/uap-core/tests/test_ua.yaml"],
	["tests/test_os.yaml", "test/uap-core/tests/test_os.yaml"],
	["tests/test_device.yaml", "test/uap-core/tests/test_device.yaml"],
	[
		"test_resources/firefox_user_agent_strings.yaml",
		"test/uap-core/test_resources/firefox_user_agent_strings.yaml"
	],
	[
		"test_resources/pgts_browser_list.yaml",
		"test/uap-core/test_resources/pgts_browser_list.yaml"
	],
	[
		"test_resources/opera_mini_user_agent_strings.yaml",
		"test/uap-core/test_resources/opera_mini_user_agent_strings.yaml"
	],
	[
		"test_resources/podcasting_user_agent_strings.yaml",
		"test/uap-core/test_resources/podcasting_user_agent_strings.yaml"
	],
	[
		"test_resources/additional_os_tests.yaml",
		"test/uap-core/test_resources/additional_os_tests.yaml"
	]
];

function download(url) {
	return new Promise((resolve, reject) => {
		https
			.get(url, (response) => {
				if (response.statusCode !== 200) {
					response.resume();
					reject(new Error(`statusCode=${response.statusCode} for ${url}`));
					return;
				}

				const chunks = [];

				response.on("data", (chunk) => {
					chunks.push(chunk);
				});

				response.on("end", () => {
					resolve(Buffer.concat(chunks));
				});
			})
			.on("error", reject);
	});
}

async function main() {
	for (const [source, output] of FILES) {
		const body = await download(BASE + source);
		const destination = path.join(PACKAGE_ROOT, output);

		fs.mkdirSync(path.dirname(destination), { recursive: true });
		fs.writeFileSync(destination, body);

		console.log(`Updated ${output}`);
	}
}

main().catch((error) => {
	process.exitCode = 1;
	console.error(error);
});
