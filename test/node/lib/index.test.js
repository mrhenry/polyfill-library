'use strict';

const test = require('node:test');
const { describe, it } = test;

const assert = require('node:assert');
const UA = require("@financial-times/polyfill-useragent-normaliser");

const appVersion = require("../../../package.json").version;

const polyfillio = require('../../../lib');

describe(".getPolyfills(features)", async () => {
	it("should not include unused dependencies", () => {
		const input = {
			features: {
				'Promise': {}
			},
			ua: new UA('chrome/45')
		};
		return polyfillio.getPolyfills(input).then(result => assert.deepEqual(result, {}));
	});

	it("https://github.com/Financial-Times/polyfill-library/issues/125", () => {
		// es6,es7&excludes=Array.prototype.values
		const input = {
			features: {
				'es6': {},
				'es7': {},
			},
			excludes: ['Array.prototype.values'],
			ua: new UA('chrome/61')
		};
		return polyfillio.getPolyfills(input).then(result => assert.deepEqual(result, {
			"Array.prototype.sort": {
				"aliasOf": new Set([
					"es6"
				]),
				"dependencyOf": new Set([]),
				"flags": new Set([]),
			},
			"_ESAbstract.CreateMethodProperty": {
				"aliasOf": new Set([
					"es6"
				]),
				"dependencyOf": new Set([
					"Array.prototype.sort"
				]),
				"flags": new Set([]),
			},
			"_ESAbstract.IsCallable": {
				"aliasOf": new Set([
					"es6"
				]),
				"dependencyOf": new Set([
					"Array.prototype.sort"
				]),
				"flags": new Set([]),
			}
		}));
	});

	it("should return polyfills for unknown UA when unknown is not set", () => {
		return polyfillio.getPolyfills({
			features: {
				'Math.sign': {}
			},
			ua: new UA('')
		}).then(result => assert.deepEqual(result, {
			'Math.sign': {
				"flags": new Set(["gated"]),
				aliasOf: new Set([]),
				dependencyOf: new Set([])
			},
			"_ESAbstract.CreateMethodProperty": {
				"dependencyOf": new Set([
					"Math.sign"
				]),
				"flags": new Set(["gated"]),
				aliasOf: new Set([])
			}
		}));
	});

	it("should return no polyfills for unknown UA when unknown is set to ignore", () => {
		return polyfillio.getPolyfills({
			features: {
				'Math.sign': {}
			},
			ua: new UA(''),
			unknown: 'ignore',
		}).then(result => assert.deepEqual(result, {}));
	});

	it("should return polyfills for unknown UA when unknown is set to `polyfill`", () => {
		return polyfillio.getPolyfills({
			features: {
				'Math.sign': {}
			},
			unknown: 'polyfill',
			ua: new UA('')
		}).then(result => assert.deepEqual(result, {
			'Math.sign': {
				"flags": new Set(["gated"]),
				aliasOf: new Set([]),
				dependencyOf: new Set([])
			},
			"_ESAbstract.CreateMethodProperty": {
				"dependencyOf": new Set([
					"Math.sign"
				]),
				"flags": new Set(["gated"]),
				aliasOf: new Set([])
			}
		}));
	});

	it("should return polyfills for unknown UA when unknown is set to `polyfill` and `ua` param is not set", () => {
		// ... even when `ua` param is missing entirely
		return polyfillio.getPolyfills({
			features: {
				'Math.sign': {}
			},
			unknown: 'polyfill',
		}).then(result => assert.deepEqual(result, {
			'Math.sign': {
				"flags": new Set(["gated"]),
				"aliasOf": new Set([]),
				"dependencyOf": new Set([])
			},
			"_ESAbstract.CreateMethodProperty": {
				"dependencyOf": new Set([
					"Math.sign"
				]),
				"flags": new Set(["gated"]),
				aliasOf: new Set([])
			}
		}));
	});

	it("should understand the 'all' alias", () => {
		return polyfillio.getPolyfills({
			features: {
				'all': {
					flags: []
				}
			},
			ua: new UA('ie/8')
		}).then(result => assert(Object.keys(result).length > 0));
	});

	it("should respect the excludes option", async () => {
		const noExcludes = await polyfillio.getPolyfills({
			features: {
				"Math.fround": {}
			},
			ua: new UA("ie/9")
		});

		assert.deepEqual(noExcludes, {
			"Math.fround": {
				flags: new Set([]),
				dependencyOf: new Set([]),
				aliasOf: new Set([])
			},
			"_ESAbstract.CreateMethodProperty": {
				flags: new Set([]),
				dependencyOf: new Set(["Math.fround"]),
				aliasOf: new Set([])
			},
			ArrayBuffer: {
				flags: new Set([]),
				dependencyOf: new Set(["Math.fround"]),
				aliasOf: new Set([])
			}
		});

		const excludes = await polyfillio.getPolyfills({
			features: {
				"Math.fround": {}
			},
			excludes: ["ArrayBuffer", "non-existent-feature"],
			ua: new UA("ie/9")
		});

		assert.deepEqual(excludes, {
			"Math.fround": {
				flags: new Set([]),
				dependencyOf: new Set([]),
				aliasOf: new Set([])
			},
			"_ESAbstract.CreateMethodProperty": {
				flags: new Set([]),
				dependencyOf: new Set(["Math.fround"]),
				aliasOf: new Set([])
			}
		});
	});
});

describe('.getPolyfillString', async () => {

	it('should produce different output when gated flag is enabled', () => {
		return Promise.all([
			polyfillio.getPolyfillString({
				features: {
					default: {}
				},
				ua: new UA('chrome/30')
			}),
			polyfillio.getPolyfillString({
				features: {
					default: {
						flags: new Set(['gated'])
					}
				},
				ua: new UA('chrome/30')
			})
		]).then(results => {
			assert.notEqual(results[0], results[1]);
		});
	});

	it('should render the version string for a production bundle', () => {
		const NODE_ENV = process.env.NODE_ENV;

		process.env.NODE_ENV = "production";

		return Promise.all([
			polyfillio.getPolyfillString({
				features: {
					default: {}
				},
				ua: new UA('chrome/30'),
				minify: false
			}),
			polyfillio.getPolyfillString({
				features: {
					default: {}
				},
				ua: new UA('chrome/30'),
				minify: true
			})
		]).then(results => {
			assert.ok(results[0].slice(0, 500).includes('Polyfill service v' + appVersion));
			assert.ok(results[1].slice(0, 500).includes('Polyfill service v' + appVersion));

			process.env.NODE_ENV = NODE_ENV;
		}).catch(err => {
			process.env.NODE_ENV = NODE_ENV;
			throw err;
		});
	});

	await it('should support streaming output', async () => {
		return new Promise((resolve) => {
			const ReadableStream = require('node:stream').Readable;
			const buf = [];
			const s = polyfillio.getPolyfillString({
				features: {
					default: {}
				},
				ua: new UA('chrome/30'),
				stream: true,
				minify: false
			});
			assert.ok(s instanceof ReadableStream);
			s.on('data', chunk => buf.push(chunk));
			s.on('end', () => {
				const bundle = buf.join('');
				assert.ok(bundle.includes('Polyfill service'));
				assert.ok(bundle.includes("function(self, undefined)"));
				resolve();
			});
		})
	});

	await it('should support custom file system implementations', async () => {
		const polyfillio = require('../../../lib');
		const sources = require('../../../lib/sources.js');

		const stream = require('node:stream');
		const fs = require('node:fs');

		const cache = new Map();

		let fileReads = 0;
		let fileCacheReads = 0;
		let streamReads = 0;
		let streamCacheReads = 0;

		sources.setFs(
			async function readFile() {
				fileReads++;

				const requested = arguments[0];
				if (cache.has(requested)) {
					fileCacheReads++;
					return cache.get(requested);
				}

				const data = await fs.promises.readFile.apply(fs.promises, arguments);

				cache.set(requested, data);

				return data;
			},
			function createReadStream() {
				streamReads++;

				const requested = arguments[0];
				if (cache.has(requested)) {
					streamCacheReads++;
					return stream.Readable.from(cache.get(requested));
				}

				const data = fs.readFileSync.apply(fs, arguments);

				cache.set(requested, data);

				return stream.Readable.from(data);
			}
		);

		return new Promise((resolve) => {
			let bundle_a = '';
			let bundle_b = '';

			const s_a = polyfillio.getPolyfillString({
				features: {
					default: {}
				},
				ua: new UA('ie/9'),
				stream: true,
				minify: false
			});

			const buf_a = [];

			s_a.on('data', chunk => buf_a.push(chunk));
			s_a.on('end', () => {
				bundle_a = buf_a.join('');

				const s_b = polyfillio.getPolyfillString({
					features: {
						default: {}
					},
					ua: new UA('ie/9'),
					stream: true,
					minify: false
				});

				const buf_b = [];

				s_b.on('data', chunk => buf_b.push(chunk));
				s_b.on('end', () => {
					bundle_b = buf_b.join('');

					assert.equal(bundle_a, bundle_b);

					assert.equal(fileCacheReads, fileReads / 2);
					assert.equal(streamCacheReads, streamReads / 2);

					resolve();
				});
			});
		});
	});
});
