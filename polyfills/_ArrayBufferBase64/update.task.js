const fs = require("fs");
const stream = require("stream");
const browserify = require("browserify");
const path = require("path");

const ArrayBufferBase64PolyfillOutput = path.resolve(
	"polyfills/_ArrayBufferBase64"
);

const entry = `
self._ArrayBufferBase64Utils = {
  uint8ArrayPrototype: {
	  setFromBase64: require("es-arraybuffer-base64/Uint8Array.prototype.setFromBase64"),
	  setFromHex: require("es-arraybuffer-base64/Uint8Array.prototype.setFromHex"),
	  toBase64: require("es-arraybuffer-base64/Uint8Array.prototype.toBase64"),
	  toHex: require("es-arraybuffer-base64/Uint8Array.prototype.toHex")
	},
	uint8Array: {
	  fromBase64: require("es-arraybuffer-base64/Uint8Array.fromBase64"),
	  fromHex: require("es-arraybuffer-base64/Uint8Array.fromHex")
	}
}
`;

const footer = `
var ArrayBufferBase64Utils = self._ArrayBufferBase64Utils;
delete self._ArrayBufferBase64Utils;
`;

const codeProcessors = [
	{
		filename: "node_modules/which-typed-array/index.js",
		description: "handle case where `descriptor` is `undefined`",
		processor: (code) => code.replace(
			"cache['$' + typedArray] = callBind(descriptor.get);",
			() => "if (descriptor) cache['$' + typedArray] = callBind(descriptor.get);"
		)
	},
	{
		filename: "node_modules/available-typed-arrays/index.js",
		description: "handle case where `Uint8Array` is an object",
		processor: (code) => code.replace(
			"typeof g[possibleNames[i]] === 'function'",
			"typeof g[possibleNames[i]] === 'function' || typeof g[possibleNames[i]] === 'object'"
		)
	},
	{
		filename: "node_modules/is-array-buffer/index.js",
		description: "handle case where `ArrayBuffer.prototype.slice` is `undefined`",
		processor: (code) => code.replace(
			"var abSlice = !!$ArrayBuffer && !$byteLength && new $ArrayBuffer(0).slice;",
			"var abSlice = !!$ArrayBuffer && !$byteLength && (new $ArrayBuffer(0).slice || new Uint8Array(0).slice);"
		)
	},
	{
		filename: "node_modules/typed-array-length/index.js",
		description: "ignore non-compliant `length` case",
		processor: (code) => code.replace(
			"oDP(arr, 'length', { value: 3 });",
			"// oDP(arr, 'length', { value: 3 });"
		)
	},
	{
		filename: "node_modules/typed-array-byte-offset/index.js",
		description: "ignore non-compliant `length` case",
		processor: (code) => code.replace(
			"oDP(arr, 'length', { value: 3 });",
			"// oDP(arr, 'length', { value: 3 });"
		)
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
		basedir: ArrayBufferBase64PolyfillOutput
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
	.bundle()
	.pipe(
		stream.Transform({
			transform: function (chunk, enc, next) {
				next(null, chunk);
			},
			flush: function (next) {
				this.push(`\n${footer}`);
				next();
			}
		})
	)
	.pipe(
		fs.createWriteStream(
			path.join(ArrayBufferBase64PolyfillOutput, "polyfill.js")
		)
	);
