"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { describe, it } = require("node:test");
const yaml = require("js-yaml");

const uaParser = require("../lib/ua_parser");

// Fixture files whose expectations describe the user agent result.
const UA_FIXTURES = [
	"tests/test_ua.yaml",
	"test_resources/firefox_user_agent_strings.yaml",
	"test_resources/pgts_browser_list.yaml",
	"test_resources/opera_mini_user_agent_strings.yaml",
	"test_resources/podcasting_user_agent_strings.yaml"
];

// Fixture files whose expectations describe the OS or the device, but which each
// still carry a user agent string that the user agent parser has to handle.
const OTHER_FIXTURES = [
	"tests/test_os.yaml",
	"tests/test_device.yaml",
	"test_resources/additional_os_tests.yaml"
];

// Local overrides are applied before the upstream rules, so they are expected to
// win over the upstream result for the user agents they match. A deviation from
// the upstream fixtures is only acceptable when one of them matches.
const overrides = yaml
	.load(
		fs.readFileSync(
			path.join(__dirname, "../compilers/overrides-regexes.yaml"),
			"utf8"
		)
	)
	.user_agent_parsers.map((parser) => new RegExp(parser.regex));

function value(input) {
	return input === undefined || input === null ? "" : String(input);
}

function readFixtures(fixturePath) {
	return yaml.load(
		fs.readFileSync(path.join(__dirname, "uap-core", fixturePath), "utf8")
	).test_cases;
}

describe("matches the upstream uap-core fixtures", () => {
	for (const fixturePath of UA_FIXTURES) {
		describe(fixturePath, () => {
			for (const fixture of readFixtures(fixturePath)) {
				it(fixture.user_agent_string, () => {
					const result = uaParser(fixture.user_agent_string);

					const matches =
						value(result.family) === value(fixture.family) &&
						value(result.major) === value(fixture.major) &&
						value(result.minor) === value(fixture.minor) &&
						value(result.patch) === value(fixture.patch);

					if (matches) {
						return;
					}

					assert.ok(
						overrides.some((override) =>
							override.test(fixture.user_agent_string)
						),
						`"${fixture.user_agent_string}" should match the upstream fixture ` +
							`${value(fixture.family)}/${value(fixture.major)}.${value(
								fixture.minor
							)}.${value(fixture.patch)} but produced ` +
							`${value(result.family)}/${value(result.major)}.${value(
								result.minor
							)}.${value(result.patch)} and no override matched`
					);
				});
			}
		});
	}
});

describe("parses the user agent of every upstream fixture", () => {
	for (const fixturePath of OTHER_FIXTURES) {
		describe(fixturePath, () => {
			for (const fixture of readFixtures(fixturePath)) {
				it(fixture.user_agent_string, () => {
					const result = uaParser(fixture.user_agent_string);

					assert.strictEqual(typeof result.family, "string");
					assert.ok(
						result.major === undefined || typeof result.major === "string"
					);
					assert.ok(
						result.minor === undefined || typeof result.minor === "string"
					);
					assert.ok(
						result.patch === undefined || typeof result.patch === "string"
					);
				});
			}
		});
	}
});
