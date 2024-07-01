'use strict';

const test = require('node:test');
const { describe, it } = test;

const assert = require('node:assert');
const UA = require('@financial-times/polyfill-useragent-normaliser');

describe('exported property/properties', () => {
	it('is an object', () => {
		assert.ok(typeof require('../../../lib') === 'object');
	});

	it('describePolyfill is an exported function', () => {
		const polyfillio = require('../../../lib');
		assert.ok(typeof polyfillio.describePolyfill === 'function');
	});

	it('listAllPolyfills is an exported function', () => {
		const polyfillio = require('../../../lib');
		assert.ok(typeof polyfillio.listAllPolyfills === 'function');
	});

	it('listAliases is an exported function', () => {
		const polyfillio = require('../../../lib');
		assert.ok(typeof polyfillio.listAliases === 'function');
	});

	it('getPolyfills is an exported function', () => {
		const polyfillio = require('../../../lib');
		assert.ok(typeof polyfillio.getPolyfills === 'function');
	});

	it('getPolyfillString is an exported function', () => {
		const polyfillio = require('../../../lib');
		assert.ok(typeof polyfillio.getPolyfillString === 'function');
	});

	it('generatePolyfillString is an exported function', () => {
		const polyfillio = require('../../../lib');
		assert.ok(typeof polyfillio.generatePolyfillString === 'function');
	});

	it('generatePolyfillString is an async generator producing strings', async () => {
		const polyfillio = require('../../../lib');
		const generator = polyfillio.generatePolyfillString({
			features: {
				default: {}
			},
			ua: new UA('chrome/30')
		});

		assert.ok(generator[Symbol.asyncIterator]);

		const result = await generator.next();
		assert.ok(typeof result.value === 'string');
	});
});

describe('.listAllPolyfills()', () => {
	it('calls and returns sourceslib.listPolyfills() without passing argument', () => {
		const polyfillio = require('../../../lib');
		return polyfillio.listAllPolyfills('test').then(result => {
			assert.ok(Array.isArray(result));
			assert.ok(result.length > 0);
			assert.deepStrictEqual(result[0], '_ESAbstract.IsPropertyKey');
			assert.ok(result.includes('AbortController'));
			assert.equal(
				result.filter(x => (typeof x === 'string')).length,
				result.length
			);
		});
	});
});

describe('.describePolyfill()', () => {
	it('calls and returns sourceslib.getPolyfillMeta() with passed argument', () => {
		const polyfillio = require('../../../lib');

		return polyfillio.describePolyfill('console.error').then(result => {
			assert.deepStrictEqual(
				result,
				{
					aliases: [
						'caniuse:console-basic'
					],
					baseDir: 'console/error',
					browsers: {
						firefox: '<5',
						ie: '*',
						ie_mob: '<10'
					},
					dependencies: [
						'console',
						'console.log'
					],
					detectSource: '"console"in self&&"error"in self.console\n',
					docs: 'https://developer.mozilla.org/en/docs/Web/API/console',
					hasTests: true,
					isPublic: true,
					isTestable: true,
					size: 26,
					spec: 'https://console.spec.whatwg.org'
				}
			);
		});
	});
});

describe('.getOptions(opts)', () => {
	it('returns fallback UA objects', () => {
		const polyfillio = require('../../../lib');

		const actual = polyfillio.getOptions();

		assert.deepStrictEqual({
			family: actual.ua.getFamily(),
			satisfies: actual.ua.satisfies("14.0.0"),
			unknown: actual.ua.isUnknown(),
		}, {
			family: 'other',
			satisfies: false,
			unknown: true,
		});
	});

	it('returns the default options if called without any arguments', () => {
		const polyfillio = require('../../../lib');

		const actual = polyfillio.getOptions();

		assert.deepStrictEqual({
			...actual,
			ua: undefined
		}, {
			callback: false,
			ua: undefined,
			minify: true,
			unknown: 'polyfill',
			features: {},
			excludes: [],
		});
	});

	it('does not assign a default value if the property exists in the argument', () => {
		const polyfillio = require('../../../lib');

		{
			const actual = polyfillio.getOptions({});

			assert.deepStrictEqual({
				...actual,
				ua: undefined
			}, {
				callback: false,
				ua: undefined,
				minify: true,
				unknown: 'polyfill',
				features: {},
				excludes: [],
			});
		}

		{
			const actual = polyfillio.getOptions({
				callback: 'app'
			});

			assert.deepStrictEqual({
				...actual,
				ua: undefined
			}, {
				callback: 'app',
				ua: undefined,
				minify: true,
				unknown: 'polyfill',
				features: {},
				excludes: [],
			});
		}

		{
			const actual = polyfillio.getOptions({
				callback: ''
			});

			assert.deepStrictEqual({
				...actual,
				ua: undefined
			}, {
				callback: false,
				ua: undefined,
				minify: true,
				unknown: 'polyfill',
				features: {},
				excludes: [],
			});
		}

		{
			const actual = polyfillio.getOptions({
				callback: 'hello world'
			});

			assert.deepStrictEqual({
				...actual,
				ua: undefined
			}, {
				callback: false,
				ua: undefined,
				minify: true,
				unknown: 'polyfill',
				features: {},
				excludes: [],
			});
		}

		{
			const actual = polyfillio.getOptions({
				ua: new UA('example')
			});

			assert.deepStrictEqual({
				...actual,
				ua: {
					family: actual.ua.getFamily(),
					isUnknown: actual.ua.isUnknown(),
				}
			}, {
				callback: false,
				ua: {
					family: 'other',
					isUnknown: true,
				},
				minify: true,
				unknown: 'polyfill',
				features: {},
				excludes: [],
			});
		}

		{
			const actual = polyfillio.getOptions({
				ua: new UA('chrome/38')
			});

			assert.deepStrictEqual({
				...actual,
				ua: {
					family: actual.ua.getFamily(),
					isUnknown: actual.ua.isUnknown(),
				}
			}, {
				callback: false,
				ua: {
					family: 'chrome',
					isUnknown: false,
				},
				minify: true,
				unknown: 'polyfill',
				features: {},
				excludes: [],
			});
		}

		{
			const actual = polyfillio.getOptions({
				minify: false
			});

			assert.deepStrictEqual({
				...actual,
				ua: undefined
			}, {
				callback: false,
				ua: undefined,
				minify: false,
				unknown: 'polyfill',
				features: {},
				excludes: [],
			});
		}

		{
			const actual = polyfillio.getOptions({
				unknown: 'ignore'
			});

			assert.deepStrictEqual({
				...actual,
				ua: undefined
			}, {
				callback: false,
				ua: undefined,
				minify: true,
				unknown: 'ignore',
				features: {},
				excludes: [],
			});
		}

		{
			const actual = polyfillio.getOptions({
				features: {
					'Array.of': {}
				}
			});

			assert.deepStrictEqual({
				...actual,
				ua: undefined
			}, {
				callback: false,
				ua: undefined,
				minify: true,
				unknown: 'polyfill',
				features: {
					'Array.of': {
						flags: new Set
					}
				},
				excludes: [],
			});
		}

		{
			const actual = polyfillio.getOptions({
				excludes: ['Array.of']
			});

			assert.deepStrictEqual({
				...actual,
				ua: undefined
			}, {
				callback: false,
				ua: undefined,
				minify: true,
				unknown: 'polyfill',
				features: {},
				excludes: ['Array.of'],
			});
		}
	});

	it('converts feature flag Arrays into Sets', () => {
		const polyfillio = require('../../../lib');

		const actual = polyfillio.getOptions({
			features: {
				'Array.from': {
					flags: ['a', 'b', 'c']
				}
			}
		});

		assert.deepStrictEqual({
			...actual,
			ua: undefined
		}, {
			callback: false,
			ua: undefined,
			minify: true,
			unknown: 'polyfill',
			features: {
				'Array.from': {
					flags: new Set(['a', 'b', 'c'])
				}
			},
			excludes: [],
		});
	});
});

describe('.getPolyfills()', () => {
	it('issue 1137 - does not error for properties which exist directly on Object.prototype', async () => {
		const polyfillio = require('../../../lib');
		const options = {
			features: {
				'constructor': {},
				'__defineGetter__': {},
				'__defineSetter__': {},
				'hasOwnProperty': {},
				'__lookupGetter__': {},
				'__lookupSetter__': {},
				'isPrototypeOf': {},
				'propertyIsEnumerable': {},
				'toString': {},
				'valueOf': {},
				'__proto__': {},
				'toLocaleString': {},
			},
			ua: new UA('ie/9')
		};
		try {
			await polyfillio.getPolyfills(options);
		} catch (error) {
			assert.fail(error, undefined, `Expected 'await polyfillio.getPolyfills(options)' to not throw an error but it threw "${error.message}"  -- ${error.stack}`)
		}
	});

	it("should remove features not appropriate for the current UA", () => {
		const polyfillio = require('../../../lib');

		const options = {
			features: {
				'console': {}
			},
			ua: new UA('chrome/120')
		};

		return polyfillio.getPolyfills(options).then(result => {
			assert.deepEqual(result, {});
		});
	});

	it("should respect the always flag", () => {
		const polyfillio = require('../../../lib');

		const options = {
			features: {
				'console': {
					flags: new Set(['always'])
				}
			},
			ua: new UA('chrome/120')
		};

		return polyfillio.getPolyfills(options).then(result => {
			assert.deepEqual(
				result,
				{
					console: {
						aliasOf: new Set(),
						dependencyOf: new Set(),
						flags: new Set(['always'])
					}
				}
			);
		});
	});

	it("should include dependencies", () => {
		const polyfillio = require('../../../lib');

		const options = {
			features: {
				'console.log': {
					flags: new Set(['always'])
				}
			},
			ua: new UA('chrome/120')
		};

		return polyfillio.getPolyfills(options).then(result => {
			assert.deepEqual(
				result,
				{
					'console.log': {
						aliasOf: new Set(),
						dependencyOf: new Set(),
						flags: new Set(['always'])
					},
					console: {
						aliasOf: new Set(),
						dependencyOf: new Set(['console.log']),
						flags: new Set(['always'])
					}
				}
			);
		});
	});
});
