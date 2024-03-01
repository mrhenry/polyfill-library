'use strict';

const test = require('node:test');
const { describe, it } = test;

const assert = require('node:assert');

describe('lib/sources', () => {
	it('exports an object', () => {
		const sources = require('../../../lib/sources');
		assert.ok(typeof sources === 'object');
	});

	it('has a getPolyfillMeta method', () => {
		const sources = require('../../../lib/sources');
		assert.ok(typeof sources.getPolyfillMeta === 'function');
	});

	it('has a listPolyfills method', () => {
		const sources = require('../../../lib/sources');
		assert.ok(typeof sources.listPolyfills === 'function');
	});

	it('has a listPolyfills method', () => {
		const sources = require('../../../lib/sources');
		assert.ok(typeof sources.listPolyfills === 'function');
	});

	it('has a getConfigAliases method', () => {
		const sources = require('../../../lib/sources');
		assert.ok(typeof sources.getConfigAliases === 'function');
	});

	it('has a streamPolyfillSource method', () => {
		const sources = require('../../../lib/sources');
		assert.ok(typeof sources.streamPolyfillSource === 'function');
	});
});

describe('sources.listPolyfills()', () => {
	it('filters out json files from the polyfill directory', () => {
		const sources = require('../../../lib/sources');

		return sources.listPolyfills().then((results) => {
			assert.ok(!results.some((x) => x.endsWith('.json')));
		});
	});

	it('returns a promise which resolves with an array containing names for each polyfilled feature', () => {
		const sources = require('../../../lib/sources');

		return sources.listPolyfills().then(result => {
			assert.ok(Array.isArray(result));
			assert.ok(result.length > 0);
			assert.deepStrictEqual(result[0], 'AbortController');
			assert.equal(
				result.filter(x => (typeof x === 'string')).length,
				result.length
			);
		});
	});
});

describe('sources.getConfigAliases()', () => {
	it('returns a promise which resolves with  an array of polyfills which are under the alias', () => {
		const sources = require('../../../lib/sources');

		return sources.getConfigAliases('es6').then(result => {
			assert.ok(Array.isArray(result));
			assert.ok(result.length > 0);
			assert.deepStrictEqual(result[0], 'Array.from');
			assert.equal(
				result.filter(x => (typeof x === 'string')).length,
				result.length
			);
		});
	});

	it('returns a promise which resolves to undefined if alias does not exist', () => {
		const sources = require('../../../lib/sources');
		return sources.getConfigAliases('es-does-not-exist').then(config => assert.ok(typeof config) === 'undefined');
	});

	it('issue 1137 - returns `undefined` for properties which exist directly on Object.prototype', async () => {
		const sources = require('../../../lib/sources');
		for (const aliasName of ['constructor','__defineGetter__','__defineSetter__','hasOwnProperty','__lookupGetter__','__lookupSetter__','isPrototypeOf','propertyIsEnumerable','toString','valueOf','__proto__','toLocaleString',]) {
			const config = await sources.getConfigAliases(aliasName);
			assert.ok(typeof config === 'undefined');
		}
	});
});

describe('sources.getPolyfillMeta()', () => {
	it('returns a promise which resolves with the metadata for a feature if it exists', () => {
		const sources = require('../../../lib/sources');
		return sources.getPolyfillMeta('console').then(meta => {
			assert.deepEqual(
				meta,
				{
					aliases: ['caniuse:console-basic'],
					dependencies: [],
					spec: 'https://console.spec.whatwg.org',
					docs: 'https://developer.mozilla.org/en/docs/Web/API/console',
					browsers: { firefox: '<5', ie: '*' },
					detectSource: '"console"in self\n',
					baseDir: 'console',
					hasTests: true,
					isTestable: true,
					isPublic: true,
					size: 30
				}
			);
		});
	});
});

describe('sources.listPolyfills()', () => {
	it('returns a promise which resolves with  an array containing names for each polyfilled feature', () => {
		const sources = require('../../../lib/sources');
		return sources.listPolyfills().then((result) => {
			assert.ok(Array.isArray(result));
			assert.ok(result.length > 0);
			assert.deepStrictEqual(result[0], 'AbortController');
			assert.equal(
				result.filter(x => (typeof x === 'string')).length,
				result.length
			);
		});
	});
});

describe('sources.streamPolyfillSource()', () => {
	it('returns a read-stream', () => {
		const sources = require('../../../lib/sources');
		const result = sources.streamPolyfillSource('Array.from', 'min');

		assert.ok(result.readable);
	});
});
