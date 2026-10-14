"use strict";

const assert = require("node:assert");
const { describe, it } = require("node:test");

const UA = require("../../");

const test_cases = require("./normalise-user-agent-test-cases.json");

describe("Node -- UA js module", function () {
	test_cases.forEach(function ({ input, output }) {
		it(`normalises ${input} into ${output}`, function () {
			assert.deepStrictEqual(UA.normalize(input), output);
		});
	});
});
