"use strict";

const fs = require("fs");
const path = require("path");
const data = JSON.parse(
	fs.readFileSync(path.join(__dirname, "data.json"), "utf8")
);

const lines = [];
const push = (line) => lines.push(line);

const PRINT_WIDTH = 80;
const TAB_WIDTH = 2;

// Measures a line the way a formatter with a 2 column tab stop would, so the
// wrapping decisions below match the expected layout.
function measure(line) {
	return line.replace(/\t/g, " ".repeat(TAB_WIDTH)).length;
}

function convertCaseInsensitivePCREToFlag(regex) {
	if (regex.startsWith("/(?i)")) {
		return regex.replace("(?i)", "") + "i";
	} else {
		return regex;
	}
}

function propertyKey(name) {
	return /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
}

// Emits `callee(arg, arg);`, wrapping the arguments when the single line form is
// too wide.
function pushCall(indent, callee, args) {
	const single = `${indent}${callee}(${args.join(", ")});`;
	if (measure(single) <= PRINT_WIDTH) {
		push(single);
		return;
	}
	push(`${indent}${callee}(`);
	args.forEach((arg, index) => {
		push(`${indent}\t${arg}${index === args.length - 1 ? "" : ","}`);
	});
	push(`${indent});`);
}

// Emits an `if (condition) {` header, wrapping a long condition onto its own
// lines.
function pushIf(indent, condition) {
	const single = `${indent}if (${condition}) {`;
	if (measure(single) <= PRINT_WIDTH) {
		push(single);
		return;
	}
	push(`${indent}if (`);
	if (condition.includes(" && ")) {
		const parts = condition.split(" && ");
		parts.forEach((part, index) => {
			push(`${indent}\t${part}${index === parts.length - 1 ? "" : " &&"}`);
		});
	} else {
		push(`${indent}\t${condition}`);
	}
	push(`${indent}) {`);
}

push(`"use strict";`);
push(``);
push(`const useragent = require("@mrhenry/polyfill-useragent-parser");`);
push(`const semver = require("semver");`);
push(``);
push(`function UA(uaString) {`);
push(`\tlet normalized;`);
push(`\tif (!uaString) {`);
push(`\t\tthis.ua = {};`);
push(`\t\tthis.ua.family = "other";`);
push(`\t\tthis.ua.major = "0";`);
push(`\t\tthis.ua.minor = "0";`);
push(`\t\tthis.ua.patch = "0";`);
push(`\t} else {`);

const normalizedMatch = `(normalized = uaString.match(${convertCaseInsensitivePCREToFlag(
	data.isNormalized
)}))`;
pushIf(`\t\t`, normalizedMatch);

push(`\t\t\tthis.ua = {`);
push(`\t\t\t\tfamily: normalized[1].toLowerCase(),`);
push(`\t\t\t\tmajor: normalized[2],`);
push(`\t\t\t\tminor: normalized[3] || "0",`);
push(`\t\t\t\tpatch: "0"`);
push(`\t\t\t};`);
push(`\t\t} else {`);

// 1. Add the normalisations
for (const { reason, regex } of data.normalisations) {
	push(`\t\t\t// ${reason}`);
	pushCall(`\t\t\t`, `uaString = uaString.replace`, [
		convertCaseInsensitivePCREToFlag(regex),
		`""`
	]);
	push(``);
}

// 2. Do the useragent parsing into family/major.minor.patch
push(`\t\t\tthis.ua = useragent(uaString);`);
push(``);

// For improved CDN cache performance, remove the patch version.
push(`\t\t\tthis.ua.patch = "0";`);
push(``);

push(`\t\t\tthis.ua.family = this.ua.family.toLowerCase();`);
push(`\t\t}`);

// 3. Aliases
for (const [family, alias] of Object.entries(data.aliases)) {
	if (typeof alias === "string") {
		push(`\t\tif (this.ua.family === ${JSON.stringify(family)}) {`);
		push(`\t\t\tthis.ua.family = ${JSON.stringify(alias)};`);
		push(`\t\t}`);
	} else if (Array.isArray(alias)) {
		push(`\t\tif (this.ua.family === ${JSON.stringify(family)}) {`);
		push(`\t\t\tthis.ua.family = ${JSON.stringify(alias[0])};`);
		push(`\t\t\tthis.ua.major = ${JSON.stringify(String(alias[1]))};`);
		push(`\t\t\tthis.ua.minor = "0";`);
		push(`\t\t}`);
	} else if (typeof alias === "object") {
		push(`\t\tif (this.ua.family === ${JSON.stringify(family)}) {`);
		for (const [range, replacement] of Object.entries(alias)) {
			const [major, minor] = range.split(".");
			const condition = [
				`this.ua.family === ${JSON.stringify(family)}`,
				`this.ua.major === ${JSON.stringify(major)}`
			];
			if (minor !== undefined) {
				condition.push(`this.ua.minor === ${JSON.stringify(minor)}`);
			}
			pushIf(`\t\t\t`, condition.join(" && "));
			push(`\t\t\t\tthis.ua.family = ${JSON.stringify(replacement[0])};`);
			push(`\t\t\t\tthis.ua.major = ${JSON.stringify(String(replacement[1]))};`);
			push(`\t\t\t\tthis.ua.minor = "0";`);
			push(`\t\t\t}`);
		}
		push(`\t\t}`);
	}
}

// 4. Check if browser and version are in the baseline supported browser versions
push(`\t\tif (`);
const baselineConditions = [`false`];
for (const [family, range] of Object.entries(data.baselineVersions)) {
	if (range === "*") {
		baselineConditions.push(`this.ua.family === ${JSON.stringify(family)}`);
	} else if (Number.isInteger(Number(range))) {
		baselineConditions.push(
			`(this.ua.family === ${JSON.stringify(
				family
			)} && Number(this.ua.major) >= ${range})`
		);
	} else {
		const [major, minor] = range.split(".");
		baselineConditions.push(
			`(this.ua.family === ${JSON.stringify(
				family
			)} && Number(this.ua.major + "." + this.ua.minor) >= ${major}.${minor})`
		);
	}
}
baselineConditions.forEach((condition, index) => {
	const isLast = index === baselineConditions.length - 1;
	const suffix = isLast ? "" : " ||";
	const single = `\t\t\t${condition}${suffix}`;
	const parts = condition.split(" && ");
	if (measure(single) > PRINT_WIDTH && parts.length === 2) {
		push(`\t\t\t${parts[0]} &&`);
		push(`\t\t\t\t${parts[1]}${suffix}`);
	} else {
		push(single);
	}
});
push(`\t\t) {`);
push(`\t\t\t/*empty*/`);
push(`\t\t} else {`);
push(`\t\t\tthis.ua.family = "other";`);
push(`\t\t\tthis.ua.major = "0";`);
push(`\t\t\tthis.ua.minor = "0";`);
push(`\t\t\tthis.ua.patch = "0";`);
push(`\t\t}`);
push(`\t}`);
push(`\tthis.version =`);
push(`\t\t(Number(this.ua.major) || 0) + "." + (Number(this.ua.minor) || 0) + ".0";`);
push(`}`);

push(``);
push(`UA.prototype.getFamily = function () {`);
push(`\treturn this.ua.family;`);
push(`};`);
push(``);
push(`UA.prototype.getVersion = function () {`);
push(`\treturn this.version;`);
push(`};`);
push(``);
push(`UA.prototype.satisfies = function (range) {`);
push(`\treturn semver.satisfies(this.version, range);`);
push(`};`);
push(``);
push(`UA.prototype.getBaseline = function () {`);
push(`\treturn UA.getBaselines()[this.ua.family];`);
push(`};`);
push(``);
push(`UA.prototype.meetsBaseline = function () {`);
push(`\treturn semver.satisfies(`);
push(`\t\tthis.version,`);
push(`\t\t">=" + UA.getBaselines()[this.ua.family]`);
push(`\t);`);
push(`};`);
push(``);
push(`UA.prototype.isUnknown = function () {`);
push(`\treturn (`);
push(`\t\tObject.keys(UA.getBaselines()).indexOf(this.ua.family) === -1 ||`);
push(`\t\t!this.meetsBaseline()`);
push(`\t);`);
push(`};`);
push(``);
push(`UA.normalize = function (uaString) {`);
push(`\tconst ua = new UA(uaString);`);
push(`\treturn ua.getFamily() + "/" + ua.version;`);
push(`};`);
push(``);
push(`UA.getBaselines = function () {`);
push(`\treturn {`);
const baselineFamilies = Object.keys(data.baselineVersions);
baselineFamilies.forEach((family, index) => {
	const isLast = index === baselineFamilies.length - 1;
	push(
		`\t\t${propertyKey(family)}: ${JSON.stringify(
			data.baselineVersions[family]
		)}${isLast ? "" : ","}`
	);
});
push(`\t};`);
push(`};`);
push(``);
push(`module.exports = UA;`);
push(``);

fs.writeFileSync(
	path.join(__dirname, "../lib/normalise-user-agent.js"),
	lines.join("\n"),
	"utf8"
);
