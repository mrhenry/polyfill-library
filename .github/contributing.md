# Contributing to polyfill-library

♥ the polyfill-library and want to get involved?
Thanks! There are plenty of ways you can help!

Please take a moment to review this document in order to make the contribution
process easy and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of
the developers managing and developing this open source project. In return,
they should reciprocate that respect in addressing your issue or assessing
patches and features.

## Adding a new polyfill

To generate the correct folder structure and files you can run `npm run create-new-polyfill <feature>`, where `<feature>` is the name of the feature. E.G. To create a new polyfill for `Element.prototype.nextElementSibling` it would be `npm run create-new-polyfill Element.prototype.nextElementSibling`.

This documentation will use the [`Element.prototype.nextElementSibling` polyfill as an example](https://github.com/mrhenry/polyfill-library/tree/main/polyfills/Element/prototype/nextElementSibling).

If you run into any issues please ask us a question, we are happy to help.

### Folder structure

The name of your folder is based on the method structure, for example:

`Element.prototype.nextElementSibling` would be `polyfills/Element/prototype/nextElementSibling`.

This folder contains 4 files:

- [config.toml](#configtoml)
- [detect.js](#detectjs)
- [polyfill.js](#polyfilljs)
- [tests.js](#testsjs)

### config.toml

#### Aliases

An alias is another name for the polyfill that can be used when requesting a bundle.

For example, the alias `es5` is used to replicate an ECMAScript 5 environment.

```toml
aliases = [
	'es5'
]
```

#### Dependencies

List any web platform features that you use in your polyfill.

For example:

```toml
dependencies = [
	"Element",
	"Object.defineProperties"
]
```

#### Browser compatibility
List what browsers require the polyfill.

You can check the related Mozilla Developer Network (MDN) page for the compatibility, they also have their browser compatibility data on GitHub.

For example: [MDN nextElementSibling browser support](https://github.com/mdn/browser-compat-data/blob/main/api/NonDocumentTypeChildNode.json#L99-L149)

Browsers that can be listed:
- android
- bb
- chrome
- edge
- edge_mob
- firefox
- ios_saf
- ie
- ie_mob
- opera
- op_mini
- safari
- firefox_mob
- samsung_mob

The browser list uses a form of semantic versioning to indicate which browser requires polyfilling.

If all versions of a browser require the polyfill you can use the wildcard asterisk (`*`):

```toml
[browsers]
android = "*"
```

For specific versions you can specify a number, for example if a polyfill is required in Internet Explorer 10 and below you can use "<11":

```toml
[browsers]
ie = "<11"
```

#### Additional information

You can use the:

- `spec` field for the feature's specification.
- `docs` field for useful information.
- `license` field for the license the code has been given.

For example:
```toml
license = "MIT"
spec = "https://dom.spec.whatwg.org/#dom-nondocumenttypechildnode-nextelementsibling"
docs = "https://developer.mozilla.org/en-US/docs/Web/API/NonDocumentTypeChildNode/nextElementSibling"
```

### detect.js

The detect.js file will be run to check if the feature is available to use in the browser.

This is sometimes called [feature detection](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/Feature_detection) and it allows the browser to [detect and defer to native implementations](https://www.w3.org/2001/tag/doc/polyfills/#detect-and-defer-to-native-implementations).

### polyfill.js

This polyfill.js file will be run to enable a browser to work without the native implementation of the feature.

If your polyfill requires other features to work [list them in the config file](#dependencies).

Make sure your polyfill [does not squat on proposed names in speculative polyfills](https://www.w3.org/2001/tag/doc/polyfills/#don-t-squat-on-proposed-names-in-speculative-polyfills).

### tests.js

You should refer to the feature's specification to see how the feature should work.

If there are [web platform tests, you should use them to help you](https://www.w3.org/2001/tag/doc/polyfills/#pass-web-platform-tests-if-they-exist).

### Local development

Setup you local environment :

`$ npm install`

Start the build watcher :

`$ npm run watch`

Or build once using `npm run build`.


After a file change you will see :

```
...
Building : <Your Polyfill>
Waiting for files to be written to disk...
Built : <Your Polyfill> in 3s
Visit : http://bs-local.com:9876/test?includePolyfills=yes&always=no&feature=<Your Polyfill>
Test server listening on port 9876!
```

### Running Tests in Github Actions on your fork.

If you have appropriate credentials for Browserstack you can configure your fork to run tests.
Only you will have access to these credentials.

**Although fully testing your changes before opening a pull request can speed up review it not a requirement.**

1. visit `Settings` > `Actions` on github and make sure actions are allowed to run.
2. visit `Settings` > `Secrets` on github and add credentials for Browserstack.
3. visit `Actions` on github and disable all workflows except `Test Polyfills`.

These credentials are required :
- `BROWSERSTACK_ACCESS_KEY`
- `BROWSERSTACK_USERNAME`

When you want to verify your changes just push to your fork and visit `Actions`.
Select `Test Polyfills` and click `Run workflow` selecting the branch where you pushed your changes.

Notes :
- tests can take a long time to run (>1h for a full run)
- multiple concurrent test runs will probably use too many Browserstack runners causing errors.

## Updating the list of browsers used during testing on BrowserStack

The files `test/polyfills/browsers.toml` and `test/polyfills/browserstackBrowsers.toml` are used to map the browser names used in polyfill configuration files to their corresponding record on BrowserStack.

To update those files with the latest set of browsers that BrowserStack support, you should run:

`$ npm run update-browserstack-list`

If the command is successful then your terminal will respond:

```
Updated the browser list for automated testing via BrowserStack.
```

## Submitting a Pull Request

Good pull requests, such as patches, improvements, and new features, are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

Please **ask first** if somebody else is already working on this or the core developers think your feature is in-scope. Generally always have a related issue with discussions for whatever you are including.

Please also provide a **test plan**, i.e. specify how you verified that your addition works.

**IMPORTANT**: By submitting a patch, you agree to allow the project
owners to license your work under the terms of the [MIT License](../LICENSE.md) and the [CLA](./contribution_licence_agreement.md).
