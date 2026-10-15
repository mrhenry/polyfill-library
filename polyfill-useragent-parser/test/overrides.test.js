"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { describe, it } = require("node:test");
const yaml = require("js-yaml");

const uaParser = require("../lib/ua_parser");

const fixtures = yaml.load(
	fs.readFileSync(path.join(__dirname, "user_agent_strings.yaml"), "utf8")
).test_cases;

function value(input) {
	return input === undefined || input === null ? "" : String(input);
}

describe("matches the local user agent fixtures", () => {
	for (const fixture of fixtures) {
		it(fixture.user_agent_string, () => {
			const result = uaParser(fixture.user_agent_string);

			assert.strictEqual(value(result.family), value(fixture.family));
			assert.strictEqual(value(result.major), value(fixture.major));
			assert.strictEqual(value(result.minor), value(fixture.minor));
			assert.strictEqual(value(result.patch), value(fixture.patch));
		});
	}
});
