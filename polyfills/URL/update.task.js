const fs = require("fs");
const stream = require("stream");
const browserify = require("browserify");
const path = require("path");

const URLPolyfillOutput = path.resolve("polyfills/URL");

const entry = `
const { URL, URLSearchParams } = require("whatwg-url");

self.URL = URL;
self.URLSearchParams = URLSearchParams;
`;

const codeProcessors = [
	{
		filename: "node_modules/webidl-conversions/lib/index.js",
		description: "strip down `webidl-conversions` to only what we need",
		processor: (code) =>
			[
				code.match(/function makeException[\w\W]+?\n}/)[0],
				code.match(/exports\.USVString = [\w\W]+?\n}/)[0],
				code.match(/exports\.DOMString = [\w\W]+?\n}/)[0]
			].join("\n")
	},
	{
		filename: "node_modules/whatwg-url/index.js",
		description: "exclude `Promise` because we don't need it",
		processor: (code) => code.replace(/ Promise, /, " /* Promise, */ ")
	},
	{
		filename: "node_modules/whatwg-url/lib/utils.js",
		description: "null-ify `AsyncIteratorPrototype` because we don't need it",
		processor: (code) =>
			code.replace(
				/const AsyncIteratorPrototype = Object\.getPrototypeOf\(Object\.getPrototypeOf\(async function\* \(\) \{\}\)\.prototype\);/,
				"const AsyncIteratorPrototype = null;"
			)
	},
	{
		filename: "node_modules/whatwg-url/lib/utils.js",
		description: "IE11 doesn't store `byteLength` on `ArrayBuffer.prototype`",
		processor: (code) =>
			code.replace(
				/Object\.getOwnPropertyDescriptor\(ArrayBuffer\.prototype, "byteLength"\)\.get;/,
				'Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength")?.get ?? Object.getOwnPropertyDescriptor(new Uint8Array(), "byteLength")?.get;'
			)
	},
	{
		filename: "node_modules/whatwg-url/lib/URL.js",
		description:
			"delete `URL.prototype.toJSON`, `URL.canParse`, and `URL.parse`, since they should come from other polyfills",
		processor: (code) =>
			code
				.replace(/ {4}toJSON\(\) {[\w\W]+?\n {4}}/, "")
				.replace(/ {4}static canParse[\w\W]+?\n {4}}/, "")
				.replace(/ {4}static parse[\w\W]+?\n {4}}/, "")
				.replace(/toJSON: { enumerable: true },?/, "")
				.replace(/canParse: { enumerable: true },?/, "")
				.replace(/parse: { enumerable: true },?/, "")
	}
];

const processCode = (file, code) => {
	for (const { filename, processor } of codeProcessors) {
		if (file.endsWith(filename)) {
			code = processor(code);
		}
	}
	return code;
};

browserify()
	.add(stream.Readable.from(entry), {
		basedir: URLPolyfillOutput
	})
	.transform(
		(file) => {
			const bufs = [];
			return new stream.Transform({
				transform: function (chunk, enc, next) {
					bufs.push(chunk);
					next();
				},
				flush: function (next) {
					const code = Buffer.concat(bufs).toString();
					this.push(processCode(file, code));
					next();
				}
			});
		},
		{
			global: true
		}
	)
	.transform("babelify", {
		global: true,
		presets: ["@babel/preset-env"]
	})
	.bundle()
	.pipe(fs.createWriteStream(path.join(URLPolyfillOutput, "polyfill.js")));
