"use strict";

const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");


// Get document, or throw exception on error
const customUap = yaml.load(
  fs.readFileSync(require.resolve("../regexes.yaml"), "utf8")
).user_agent_parsers;
const uap = yaml.load(
  fs.readFileSync(require.resolve("../uap-core/regexes.yaml"), "utf8")
).user_agent_parsers;
const start = `module.exports = function useragent_parser(ua) {
  const family = "Other";
  let major;
  let minor;
  let patch;
  let result;
  if (!ua) {
    return {
      family,
      major,
      minor,
      patch
    };
  }`;
const end = `
  return {
      family,
      major,
      minor,
      patch
  };
}`;
let file = "";
for (const agent of customUap.concat(uap)) {
  const amountOfCapturingGroupsInRegex = (new RegExp(agent.regex + '|')).exec('').length - 1;

  let s = "";
  s += ` else if (result = ${new RegExp(agent.regex).toString()}.exec(ua)) {`;

  if (agent.family_replacement) {
      if (agent.family_replacement.includes("$1")) {
        s += `\n\t\tconst family = "${agent.family_replacement}".replace('$1', result[1]);`;
      } else {
        s += `\n\t\tconst family = "${agent.family_replacement}";`;
      }
  } else {
    s += `\n\t\tconst family = result[1];`;
  }

  if (agent.v1_replacement) {
    s += `\n\t\tconst major = "${agent.v1_replacement}";`;
  } else if (amountOfCapturingGroupsInRegex > 1) {
    s += `\n\t\tconst major = result[2];`;
  }

  if (agent.v2_replacement) {
    s += `\n\t\tconst minor="${agent.v2_replacement}";`;
  } else if (amountOfCapturingGroupsInRegex > 2) {
    s += `\n\t\tconst minor = result[3];`;
  }

  if (agent.v3_replacement) {
    s += `\n\t\tconst patch="${agent.v3_replacement}";`;
  } else if (amountOfCapturingGroupsInRegex > 3) {
    s += `\n\t\tconst patch = result[4];`;
  }
  s += `\n\t\treturn {family,major,minor,patch};`;

  s += "\n\t}";
  file += s;
}
fs.writeFileSync(
  path.join(__dirname, "../lib/ua_parser.js"),
  start + file + end,
  "utf8"
);
