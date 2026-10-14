# User Agent parser

This is a JavaScript implementation of the [ua-parser](https://github.com/tobie/ua-parser)

# Usage

```js
const useragent = require('@mrhenry/polyfill-useragent-parser');

console.log(useragent(request.headers['user-agent']))
/*
  {
    family: 'chrome',
    major: 71,
    minor: 1,
    patch: 0
  }
*/
```

# Regex sources

`lib/ua_parser.js` is compiled from two lists in `compilers/`:

- `uap-core-regexes.yaml` — the upstream [uap-core](https://github.com/ua-parser/uap-core) regex definitions.
- `overrides-regexes.yaml` — local overrides, applied before the upstream rules.

# Updating the upstream data

`npm run update-uap-core` refreshes the vendored upstream data: the regex
definitions above and the upstream test fixtures under `test/uap-core`.
Rebuild the parser afterwards:

```sh
npm run update-uap-core
npm run build
```

# Tests

`npm test` (native `node --test`) runs:

- `test/ua.test.js` — the local fixtures.
- `test/upstream.test.js` — verifies the parser against the upstream fixtures in
  `test/uap-core`. Deviations are only allowed for user agents matched by
  `compilers/overrides-regexes.yaml`.
- `test/browserstack.test.js` — verifies the parser against the fixtures in
  `test/browserstack-useragent-strings.yaml`.
