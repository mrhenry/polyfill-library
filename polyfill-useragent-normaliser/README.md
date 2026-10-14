# User Agent normaliser

This is the JavaScript implementation of the User-Agent normalisation used within the [polyfill-library](https://github.com/mrhenry/polyfill-library).

# Usage

For a request which was the user-agent Chrome 71.1:

# Example

```js
const UA = require('@mrhenry/polyfill-useragent-normaliser');

const useragent = new UA(request.headers['user-agent']);
console.log(useragent.isUnknown()); // false
console.log(useragent.satisfies("<50")); // false
console.log(useragent.satisfies(">50")); // true
```
