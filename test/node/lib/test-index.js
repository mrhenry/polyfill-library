'use strict';

const { assert } = require('chai');
const UA = require("@financial-times/polyfill-useragent-normaliser");

const appVersion = require("../../../package.json").version;
const setsToArrays = require('../../utils/sets-to-arrays');

const polyfillio = require('../../../lib');

describe("polyfillio", function () {
	this.timeout(30000);

	describe(".getPolyfills(features)", () => {

		it("should not include unused dependencies", () => {
			const input = {
				features: {
					'Promise': {}
				},
				ua: new UA('chrome/45')
			};
			return polyfillio.getPolyfills(input).then(result => assert.deepEqual(setsToArrays(result), {}));
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
			return polyfillio.getPolyfills(input).then(result => assert.deepEqual(setsToArrays(result), {
				"Array.prototype.sort": {
					"aliasOf": [
						"es6"
					],
					"dependencyOf": [],
					"flags": [],
				},
				"_ESAbstract.CreateMethodProperty": {
					"aliasOf": [
						"es6"
					],
					"dependencyOf": [
						"Array.prototype.sort"
					],
					"flags": [],
				},
				"_ESAbstract.IsCallable": {
					"aliasOf": [
						"es6"
					],
					"dependencyOf": [
						"Array.prototype.sort"
					],
					"flags": [],
				}
			}));
		});

		it("should return polyfills for unknown UA when unknown is not set", () => {
			return polyfillio.getPolyfills({
				features: {
					'Math.sign': {}
				},
				ua: new UA('')
			}).then(result => assert.deepEqual(setsToArrays(result), {
				'Math.sign': {
					"flags": ["gated"],
					aliasOf: [],
					dependencyOf: []
				},
				"_ESAbstract.CreateMethodProperty": {
					"dependencyOf": [
						"Math.sign"
					],
					"flags": ["gated"],
					aliasOf: []
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
			}).then(result => assert.deepEqual(setsToArrays(result), {}));
		});

		it("should return polyfills for unknown UA when unknown is set to `polyfill`", () => {
			return polyfillio.getPolyfills({
				features: {
					'Math.sign': {}
				},
				unknown: 'polyfill',
				ua: new UA('')
			}).then(result => assert.deepEqual(setsToArrays(result), {
				'Math.sign': {
					"flags": ["gated"],
					aliasOf: [],
					dependencyOf: []
				},
				"_ESAbstract.CreateMethodProperty": {
					"dependencyOf": [
						"Math.sign"
					],
					"flags": ["gated"],
					aliasOf: []
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
			}).then(result => assert.deepEqual(setsToArrays(result), {
				'Math.sign': {
					"flags": ["gated"],
					"aliasOf": [],
					"dependencyOf": []
				},
				"_ESAbstract.CreateMethodProperty": {
					"dependencyOf": [
						"Math.sign"
					],
					"flags": ["gated"],
					aliasOf: []
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

			assert.deepEqual(setsToArrays(noExcludes), {
				"Math.fround": {
					flags: [],
					dependencyOf: [],
					aliasOf: []
				},
				"_ESAbstract.CreateMethodProperty": {
					flags: [],
					dependencyOf: ["Math.fround"],
					aliasOf: []
				},
				ArrayBuffer: {
					flags: [],
					dependencyOf: ["Math.fround"],
					aliasOf: []
				}
			});

			const excludes = await polyfillio.getPolyfills({
				features: {
					"Math.fround": {}
				},
				excludes: ["ArrayBuffer", "non-existent-feature"],
				ua: new UA("ie/9")
			});

			assert.deepEqual(setsToArrays(excludes), {
				"Math.fround": {
					flags: [],
					dependencyOf: [],
					aliasOf: []
				},
				"_ESAbstract.CreateMethodProperty": {
					flags: [],
					dependencyOf: ["Math.fround"],
					aliasOf: []
				}
			});
		});
	});

	describe('.getPolyfillString', () => {

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
				assert.notEqual(setsToArrays(results[0]), setsToArrays(results[1]));
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
				}, polyfillio.getPolyfillString({
					features: {
						default: {}
					},
					ua: new UA('chrome/30'),
					minify: true
				}))
			]).then(results => {
				assert.include(results[0].slice(0, 500), 'Polyfill service ' + appVersion);
				assert.include(results[1].slice(0, 500), 'Polyfill service ' + appVersion);

				process.env.NODE_ENV = NODE_ENV;
			}).catch(() => {
				process.env.NODE_ENV = NODE_ENV;
			});
		});

		it('should support streaming output', done => {
			const ReadableStream = require('stream').Readable;
			const buf = [];
			const s = polyfillio.getPolyfillString({
				features: {
					default: {}
				},
				ua: new UA('chrome/30'),
				stream: true,
				minify: false
			});
			assert.instanceOf(s, ReadableStream);
			s.on('data', chunk => buf.push(chunk));
			s.on('end', () => {
				const bundle = buf.join('');
				assert.include(bundle, 'Polyfill service');
				assert.include(bundle, "function(self, undefined)");
				done();
			});
		});

		it('should support cached streaming output', done => {
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
					done();
				});
			});
		});
	});
});
