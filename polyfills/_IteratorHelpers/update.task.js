const fs = require("fs");
const stream = require("stream");
const browserify = require("browserify");
const path = require("path");

const IteratorHelpersPolyfillOutput = path.resolve(
	"polyfills/_IteratorHelpers"
);

const entry = `
require("es-iterator-helpers/auto");
`;

const footer = `
var IteratorHelpersUtils = (function () {
	var iteratorPrototypeMethods = {};
	var iteratorPrototypeMethodNames = Object.getOwnPropertyNames(Iterator.prototype);
	for (var i = 0; i < iteratorPrototypeMethodNames.length; i++) {
		var methodName = iteratorPrototypeMethodNames[i];
		if (/^_/.test(methodName) || ['constructor', 'next', 'toString'].indexOf(methodName) > -1) continue;
		iteratorPrototypeMethods[methodName] = Iterator.prototype[methodName];
		delete Iterator.prototype[methodName];
	}

	var iteratorMethods = {};
	var iteratorMethodNames = Object.getOwnPropertyNames(Iterator);
	for (var i = 0; i < iteratorMethodNames.length; i++) {
		var methodName = iteratorMethodNames[i];
		if (['length', 'name', 'prototype', 'caller', 'arguments'].indexOf(methodName) > -1) continue;
		iteratorMethods[methodName] = Iterator[methodName];
		delete Iterator[methodName];
	}

	return {
		iteratorPrototype: iteratorPrototypeMethods,
		iterator: iteratorMethods
	};
})();
`;

browserify()
	.add(stream.Readable.from(entry), {
		basedir: IteratorHelpersPolyfillOutput
	})
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
			path.join(IteratorHelpersPolyfillOutput, "polyfill.js")
		)
	);
