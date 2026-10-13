"use strict";

const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

const customUap = yaml.load(
	fs.readFileSync(require.resolve("../regexes.yaml"), "utf8")
).user_agent_parsers;
const uap = yaml.load(
	fs.readFileSync(require.resolve("../uap-core/regexes.yaml"), "utf8")
).user_agent_parsers;
const agents = customUap.concat(uap);

const lines = [];
const push = (line) => lines.push(line);

const PRINT_WIDTH = 80;
const TAB_WIDTH = 2;

// Measures a line the way a formatter with a 2 column tab stop would, so the
// wrapping decisions below match the expected layout.
function measure(line) {
	return line.replace(/\t/g, " ".repeat(TAB_WIDTH)).length;
}

// 1. Emit the module and the initial guard.
push(`module.exports = function useragent_parser(ua) {`);
push(`\tconst family = "Other";`);
push(`\tlet major;`);
push(`\tlet minor;`);
push(`\tlet patch;`);
push(`\tlet result;`);
push(`\tif (!ua) {`);
push(`\t\treturn {`);
push(`\t\t\tfamily,`);
push(`\t\t\tmajor,`);
push(`\t\t\tminor,`);
push(`\t\t\tpatch`);
push(`\t\t};`);

// 2. Emit a branch per regex. Each branch assigns the match to `result` and
// returns the parsed family and version. The header is wrapped based on the
// length of the regex.
agents.forEach((agent) => {
	const amountOfCapturingGroupsInRegex =
		new RegExp(agent.regex + "|").exec("").length - 1;
	const regex = new RegExp(agent.regex).toString();

	const single = `\t} else if ((result = ${regex}.exec(ua))) {`;
	const inner = `\t\t(result = ${regex}.exec(ua))`;
	const call = `\t\t(result = ${regex}.exec(`;
	const rhs = `\t\t\t${regex}.exec(ua))`;

	if (measure(single) <= PRINT_WIDTH) {
		push(single);
	} else if (measure(inner) <= PRINT_WIDTH) {
		push(`\t} else if (`);
		push(inner);
		push(`\t) {`);
	} else if (measure(call) <= PRINT_WIDTH) {
		push(`\t} else if (`);
		push(call);
		push(`\t\t\tua`);
		push(`\t\t))`);
		push(`\t) {`);
	} else if (measure(rhs) <= PRINT_WIDTH) {
		push(`\t} else if (`);
		push(`\t\t(result =`);
		push(rhs);
		push(`\t) {`);
	} else {
		push(`\t} else if (`);
		push(`\t\t(result =`);
		push(`\t\t\t${regex}.exec(`);
		push(`\t\t\t\tua`);
		push(`\t\t\t))`);
		push(`\t) {`);
	}

	if (agent.family_replacement) {
		if (agent.family_replacement.includes("$1")) {
			push(
				`\t\tconst family = ${JSON.stringify(
					agent.family_replacement
				)}.replace("$1", result[1]);`
			);
		} else {
			push(
				`\t\tconst family = ${JSON.stringify(agent.family_replacement)};`
			);
		}
	} else {
		push(`\t\tconst family = result[1];`);
	}

	if (agent.v1_replacement) {
		push(`\t\tconst major = ${JSON.stringify(agent.v1_replacement)};`);
	} else if (amountOfCapturingGroupsInRegex > 1) {
		push(`\t\tconst major = result[2];`);
	}

	if (agent.v2_replacement) {
		push(`\t\tconst minor = ${JSON.stringify(agent.v2_replacement)};`);
	} else if (amountOfCapturingGroupsInRegex > 2) {
		push(`\t\tconst minor = result[3];`);
	}

	if (agent.v3_replacement) {
		push(`\t\tconst patch = ${JSON.stringify(agent.v3_replacement)};`);
	} else if (amountOfCapturingGroupsInRegex > 3) {
		push(`\t\tconst patch = result[4];`);
	}

	push(`\t\treturn { family, major, minor, patch };`);
});
push(`\t}`);

// 3. Emit the fallback return.
push(`\treturn {`);
push(`\t\tfamily,`);
push(`\t\tmajor,`);
push(`\t\tminor,`);
push(`\t\tpatch`);
push(`\t};`);
push(`};`);
push(``);

fs.writeFileSync(
	path.join(__dirname, "../lib/ua_parser.js"),
	lines.join("\n"),
	"utf8"
);
