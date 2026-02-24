const fs = require("fs");
const stream = require("stream");
const browserify = require("browserify");
const path = require("path");

const IteratorHelpersPolyfillOutput = path.resolve(
	"polyfills/_IteratorHelpers"
);

const entry = `
self._IteratorHelpers = {
  iteratorPrototype: {
	  drop: require("es-iterator-helpers/Iterator.prototype.drop"),
	  every: require("es-iterator-helpers/Iterator.prototype.every"),
	  filter: require("es-iterator-helpers/Iterator.prototype.filter"),
	  find: require("es-iterator-helpers/Iterator.prototype.find"),
	  flatMap: require("es-iterator-helpers/Iterator.prototype.flatMap"),
	  forEach: require("es-iterator-helpers/Iterator.prototype.forEach"),
	  map: require("es-iterator-helpers/Iterator.prototype.map"),
	  reduce: require("es-iterator-helpers/Iterator.prototype.reduce"),
	  some: require("es-iterator-helpers/Iterator.prototype.some"),
	  take: require("es-iterator-helpers/Iterator.prototype.take"),
	  toArray: require("es-iterator-helpers/Iterator.prototype.toArray")
	},
	iterator: {
	  from: require("es-iterator-helpers/Iterator.from")
	}
}
`;

const footer = `
var IteratorHelpers = self._IteratorHelpers;
delete self._IteratorHelpers;
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
