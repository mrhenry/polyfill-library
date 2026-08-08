const fs = require("fs");
const path = require("path");

const sumPrecisePolyfillOutput = path.resolve("polyfills/Math/sumPrecise");
const polyfillBase = fs.readFileSync(path.join(sumPrecisePolyfillOutput, "polyfill.base.js")).toString();
const computeSumImplementation = fs.readFileSync("node_modules/math.sumprecise/sum.js").toString();

const polyfill = `
// NOTE: This polyfill is auto-generated; modifications should be made in \`polyfill.base.js\` and \`update.task.js\`.

${polyfillBase.replace(
	"// NOTE: This will be replaced by an implementation in `update.task.js`",
	computeSumImplementation.replace("module.exports = ", "return ")
)}`;

fs.writeFileSync(path.join(sumPrecisePolyfillOutput, "polyfill.js"), polyfill);
