# User Agent parser

This is a JavaScript implementation of the [ua-parser](https://github.com/tobie/ua-parser)

# Usage

## Updating

  `uap-core` definitions are, by default, compiled and included in the package. Updating `uap-core` is done every day via a GitHub Action.

# Example

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
