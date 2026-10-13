"use strict";

const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

/**
 * Converts non-ASCII characters into their equivalent unicode escape sequence.
 * @param {String} str The string that you want to convert into ASCII and unicode escape sequences
 * @returns {String}
 */
function escapeNonAsciiCharacters(str) {
  return str
    .split('')
    .map(c => {
      if (c.charCodeAt(0) > 127) {
        return '%u' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, 0)
      } else {
        return c;
      }
    })
    .join('')
}

function convertToFastlyRegExpCaptureGroups(str) {
  return str
    .replace(/\$([0-9])+/g, 're.group.$1')
    .split(/(re\.group\.[0-9]+)/)
    .map(str => str.startsWith("re.group.") ? str : `"${str}"`)
    .join(" ");
}

const customUap = yaml.load(
  fs.readFileSync(require.resolve("../regexes.yaml"), "utf8")
).user_agent_parsers;
// Get document, or throw exception on error
const uap = yaml.load(
  fs.readFileSync(require.resolve("../uap-core/regexes.yaml"), "utf8")
).user_agent_parsers;
const start = `sub useragent_parser {
  declare local var.Family STRING;
  set var.Family = "Other";
  declare local var.Major STRING;
  set var.Major = "";
  declare local var.Minor STRING;
  set var.Minor = "";
  declare local var.Patch STRING;
  set var.Patch = "";
  if (!req.http.User-Agent) {
  }`;
const end = `
  set req.http.useragent_parser_family=var.Family;
  set req.http.useragent_parser_major=var.Major;
  set req.http.useragent_parser_minor=var.Minor;
  set req.http.useragent_parser_patch=var.Patch;
}`;
let file = "";
for (const agent of customUap.concat(uap)) {
  const amountOfCapturingGroupsInRegex = (new RegExp(agent.regex + '|')).exec('').length - 1;
  
  let s = "";
  s += ` else if (req.http.User-Agent ~ {"${agent.regex}"}) {`;
  
  if (agent.family_replacement) {
    const fastlySafeString = convertToFastlyRegExpCaptureGroups(escapeNonAsciiCharacters(agent.family_replacement));
    s += `\n\t\tset var.Family = ${fastlySafeString};`;
  } else {
    s += `\n\t\tset var.Family = re.group.1;`;
  }

  if (agent.v1_replacement) {
    const fastlySafeString = convertToFastlyRegExpCaptureGroups(escapeNonAsciiCharacters(agent.v1_replacement));
    s += `\n\t\tset var.Major = ${fastlySafeString};`;
  } else if (amountOfCapturingGroupsInRegex > 1) {
    s += `\n\t\tset var.Major = re.group.2;`;
  }

  if (agent.v2_replacement) {
    const fastlySafeString = convertToFastlyRegExpCaptureGroups(escapeNonAsciiCharacters(agent.v2_replacement));
    s += `\n\t\tset var.Minor=${fastlySafeString};`;
  } else if (amountOfCapturingGroupsInRegex > 2) {
    s += `\n\t\tset var.Minor = re.group.3;`;
  }

  if (agent.v3_replacement) {
    const fastlySafeString = convertToFastlyRegExpCaptureGroups(escapeNonAsciiCharacters(agent.v3_replacement));
    s += `\n\t\tset var.Patch=${fastlySafeString};`;
  } else if (amountOfCapturingGroupsInRegex > 3) {
    s += `\n\t\tset var.Patch = re.group.4;`;
  }

  s += "\n\t}";
  file += s;
}
fs.writeFileSync(
  path.join(__dirname, "../lib/ua_parser.vcl"),
  start + file + end,
  "utf8"
);
