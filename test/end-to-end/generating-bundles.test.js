'use strict';

const test = require('node:test');
const { describe, it } = test;

const assert = require('node:assert');
const ua_parser = require('../polyfills/ua-parser');
const polyfillLibrary = require('../..');

describe("polyfill-library", function () {
	it('should produce same output for same bundle', async () => {
		const bundle1 = await polyfillLibrary.getPolyfillString({
			features: {
				all: {}
			},
			ua: ua_parser('other/0.0.0'),
			unknown: 'polyfill'
		});

		const bundle2 = await polyfillLibrary.getPolyfillString({
			features: {
				all: {}
			},
			ua: ua_parser('other/0.0.0'),
			unknown: 'polyfill'
		});

		assert.deepStrictEqual(bundle1, bundle2);
	});

	it('should not error - issue 1137', async () => {
		await polyfillLibrary.getPolyfillString({
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
			ua: ua_parser('other/0.0.0'),
			unknown: 'polyfill'
		});
	});
});
