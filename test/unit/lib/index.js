'use strict';

const {assert} = require('chai');
const mockery = require('mockery');
const setsToArrays = require('../../utils/sets-to-arrays');
const realUA = require('@financial-times/polyfill-useragent-normaliser');

describe("polyfillio", () => {
	const packageMock = {};
	let fs;
	let path;
	let toposort;
	let UA;
	let sourceslib;
	let handlebars;
	let streamFromPromise;
	let from2String;
	let merge2;
	let streamToString;

	beforeEach(() => {
		fs = require('../mock/graceful-fs.mock');
		mockery.registerMock('graceful-fs', fs);

		path = require('../mock/path.mock');
		mockery.registerMock('path', path);

		toposort = require('../mock/toposort.mock');
		mockery.registerMock('toposort', toposort);

		UA = require('../mock/ua.mock');
		mockery.registerMock('@financial-times/polyfill-useragent-normaliser', UA);

		sourceslib = require('../mock/sources.mock');
		mockery.registerMock('./sources', sourceslib);

		mockery.registerMock('package', packageMock);

		handlebars = require('../mock/handlebars.mock');
		mockery.registerMock('handlebars', handlebars);

		streamFromPromise = require('../mock/stream-from-promise.mock');
		mockery.registerMock('stream-from-promise', streamFromPromise);

		from2String = require('../mock/from2-string.mock');
		mockery.registerMock('from2-string', from2String);

		merge2 = require('../mock/merge2.mock');
		mockery.registerMock('merge2', merge2);

		streamToString = require('../mock/stream-to-string.mock');
		mockery.registerMock('stream-to-string', streamToString);

	});

	describe('exported property/properties', () => {
		it('is an object', () => {
			assert.isObject(require('../../../lib'));
		});

		it('describePolyfill is an exported function', () => {
			const polyfillio = require('../../../lib');
			assert.isFunction(polyfillio.describePolyfill);
		});

		it('listAllPolyfills is an exported function', () => {
			const polyfillio = require('../../../lib');
			assert.isFunction(polyfillio.listAllPolyfills);
		});

		it('listAliases is an exported function', () => {
			const polyfillio = require('../../../lib');
			assert.isFunction(polyfillio.listAliases);
		});

		it('getPolyfills is an exported function', () => {
			const polyfillio = require('../../../lib');
			assert.isFunction(polyfillio.getPolyfills);
		});

		it('getPolyfillString is an exported function', () => {
			const polyfillio = require('../../../lib');
			assert.isFunction(polyfillio.getPolyfillString);
		});
	});

	describe('.listAllPolyfills()', () => {
		it('calls and returns sourceslib.listPolyfills() without passing argument', () => {
			const polyfillio = require('../../../lib');
			sourceslib.listPolyfills.resolves('return value for sourceslib.listPolyfills');
			return polyfillio.listAllPolyfills('test').then(result => {
				assert.equal(result, 'return value for sourceslib.listPolyfills');
				assert.calledOnce(sourceslib.listPolyfills);
				assert.neverCalledWith(sourceslib.listPolyfills, 'test');
			});
		});
	});

	describe('.describePolyfill()', () => {
		it('calls and returns sourceslib.getPolyfillMeta() with passed argument', () => {
			const polyfillio = require('../../../lib');

			sourceslib.getPolyfillMeta.resolves('return value for sourceslib.getPolyfillMeta');
			return polyfillio.describePolyfill('test')
				.then(result => {
					assert.equal(result, 'return value for sourceslib.getPolyfillMeta');
					assert.calledOnce(sourceslib.getPolyfillMeta);
					assert.calledWithExactly(sourceslib.getPolyfillMeta, 'test');
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
					ua: new realUA('example')
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
					ua: new realUA('chrome/38')
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
			sourceslib.getPolyfillMeta.resolves({
				"browsers": {
					"ie": "6 - 8"
				}
			});
			UA.mockUAInstance.getFamily.returns('ie');
			UA.mockUAInstance.satisfies.returns(false);

			const polyfillio = require('../../../lib');

			const options = {
				features: {
					'Array.prototype.map': {}
				},
				ua: new UA('ie/9')
			};

			return polyfillio.getPolyfills(options).then(result => {
				assert.deepEqual(setsToArrays(result), {});
			});
		});

		it("should respect the always flag", () => {
			sourceslib.getPolyfillMeta.resolves({
				"browsers": {
					"ie": "6 - 8"
				}
			});
			UA.mockUAInstance.getFamily.returns('ie');
			UA.mockUAInstance.satisfies.returns(false);

			const polyfillio = require('../../../lib');

			const input = {
				features: {
					'Array.prototype.map': {
						flags: new Set(['always'])
					}
				},
				ua: new UA('ie/9')
			};
			const expectedResult = {
				'Array.prototype.map': {
					flags: ['always'],
					aliasOf: [],
					dependencyOf: []
				}
			};
			return polyfillio.getPolyfills(input).then(result => {
				assert.deepEqual(setsToArrays(result), expectedResult);
			});
		});

		it("should include dependencies", () => {
			sourceslib.getPolyfillMeta.withArgs('Element.prototype.placeholder').resolves({
				"dependencies": ["setImmediate", "Event"],
				"browsers": {
					"ie": "*"
				}
			});
			sourceslib.getPolyfillMeta.withArgs('setImmediate').resolves({
				"dependencies": [],
				"browsers": {
					"ie": "*"
				}
			});
			sourceslib.getPolyfillMeta.withArgs('Array.isArray').resolves({
				"dependencies": [],
				"browsers": {
					"ie": "*"
				}
			});
			sourceslib.getPolyfillMeta.withArgs('Event').resolves({
				"dependencies": [],
				"browsers": {
					"ie": "*"
				}
			});

			UA.mockUAInstance.getFamily.returns('ie');
			UA.mockUAInstance.satisfies.returns(true);

			const polyfillio = require('../../../lib');

			const input = {
				features: {
					'Element.prototype.placeholder': {
						flags: new Set()
					}
				},
				ua: new UA('ie/8')
			};

			return polyfillio.getPolyfills(input).then((polyfills) => {
				const polyfillNames = Object.keys(polyfills)
				assert.deepEqual(polyfillNames, [
					"Element.prototype.placeholder",
					"setImmediate",
					"Event"
				]);
			});
		});
	});
});
