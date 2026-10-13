# User Agent parser in VCL & JS

This is the VCL & JS implementation of the [ua-parser](https://github.com/tobie/ua-parser)

# Usage

## Updating

  `uap-core` definitions are, by default, compiled and included in the package. Updating `uap-core` is done every day via a GitHub Action.

# Example in VCL

For a request which was the user-agent Chrome 71.1:
```vcl
import ua_parser;

sub vcl_recv {
  call useragent_parser;
  # req.http.useragent_parser_family = "chrome";
  # req.http.useragent_parser_major = "71";
  # req.http.useragent_parser_minor = "1";
  # req.http.useragent_parser_patch = "0";
}
```

# Example in JS

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
