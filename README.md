
# @mhrenry/polyfill-library &middot; [![license][license-badge]][license] [![PRs Welcome][pull-requests-badge]][contributing-guide]

> NodeJS module to create polyfill bundles tailored to individual user-agents

## Install

```bash
npm install @mrhenry/polyfill-library --save
```

## Usage

```javascript
const polyfillLibrary = require('@mrhenry/polyfill-library');
const UA = require('@financial-times/polyfill-useragent-normaliser');

const polyfillBundle = polyfillLibrary.getPolyfillString({
	ua: new UA('Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)'),
	minify: true,
	features: {
		'es6': { flags: ['gated'] }
	}
}).then(function(bundleString) {
	console.log(bundleString);
});
```

## API

### `polyfillLibrary.listAllPolyfills()`

Get a list of all the polyfills which exist within the collection of polyfill sources.

Returns a Promise which resolves with an array of all the polyfills within the collection.

### `polyfillLibrary.describePolyfill(featureName)`

Get the metadata for a specific polyfill within the collection of polyfill sources.

- `@param {String} featureName` - The name of a polyfill whose metadata should be returned.

Returns a Promise which resolves with the metadata or with `undefined` if no metadata exists for the polyfill.

### `polyfillLibrary.getOptions(opts = {})`

Create an options object for use with `getPolyfills` or `getPolyfillString`.

- `@param {object} opts` - Valid keys are ua, minify, unknown, excludes and features.
- `@param {Boolean} [opts.minify=true]` - Whether to return the minified or raw implementation of the polyfills.
- `@param {'ignore'|'polyfill'} [opts.unknown='polyfill']` - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
- `@param {Object} [opts.features={}]` - Which features should be returned if the user-agent does not support them natively.
- `@param {Array<String>} [opts.excludes=[]]` - Which features should be excluded from the returned object.
- `@param {Object} [opts.ua={}]` - The user-agent object to check each feature against.

Returns an object which has merged `opts` with the defaults option values.

### `polyfillLibrary.getPolyfills(opts)`

Given a set of features that should be polyfilled in 'opts.features' (with flags i.e. `{<featurename>: {flags:Set[<flaglist>]}, ...}`), determine which have a configuration valid for the given opts.ua, and return a promise of set of canonical (unaliased) features (with flags) and polyfills.

- `@param {object} opts` - Valid keys are ua, minify, unknown, excludes and features.
- `@param {Boolean} [opts.minify=true]` - Whether to return the minified or raw implementation of the polyfills.
- `@param {'ignore'|'polyfill'} [opts.unknown='polyfill']` - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
- `@param {Object} [opts.features={}]` - Which features should be returned if the user-agent does not support them natively.
- `@param {Array<String>} [opts.excludes=[]]` - Which features should be excluded from the returned object.
- `@param {Object} [opts.ua={}]` - The user-agent object to check each feature against.

Returns a Promise which resolves to an Object which contains the canonicalised feature definitions filtered for UA.

### `polyfillLibrary.getPolyfillString(opts)`

Create a polyfill bundle.

- `@param {object} opts` - Valid keys are ua, minify, unknown, excludes and features.
- `@param {Boolean} [opts.minify=true]` - Whether to return the minified or raw implementation of the polyfills.
- `@param {'ignore'|'polyfill'} [opts.unknown='polyfill']` - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
- `@param {Object} [opts.features={}]` - Which features should be returned if the user-agent does not support them natively.
- `@param {Array<String>} [opts.excludes=[]]` - Which features should be excluded from the returned object.
- `@param {Object} [opts.ua={}]` - The user-agent object to check each feature against.
- `@param {Boolean} [opts.stream=false]` - Whether to return a stream or a string of the polyfill bundle.

Returns a polyfill bundle as either a utf-8 ReadStream or as a Promise of a utf-8 String.

## Contributing

Development of @mrhenry/polyfill-library happens on GitHub. Read below to learn how you can take part in contributing.

### [Contributing Guide][contributing-guide]

Read our [contributing guide][contributing-guide] to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

```
npm run install
npm run watch
```

### License

@mrhenry/polyfill-library is [MIT licensed][license].

## History

See [./HISTORY.md](./HISTORY.md)

[contributing-guide]: https://github.com/mrhenry/polyfill-library/blob/main/.github/contributing.md
[license]: https://github.com/mrhenry/polyfill-library/blob/main/LICENSE.md
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[pull-requests-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
