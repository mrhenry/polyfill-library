### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

#### v5.1.0

- Add `Promise.withResolvers` [`#23`](https://github.com/mrhenry/polyfill-library/pull/23) by @mhassan1
- Add `Event.scrollend` [`#30`](https://github.com/mrhenry/polyfill-library/pull/30)
- Fix `IteratorClose` to throw correctly [`#25`](https://github.com/mrhenry/polyfill-library/pull/25) by @mhassan1

#### v5.0.0

- Remove direct dependency on `@financial-times/polyfill-useragent-normaliser`.
- Remove `normalizeUserAgent` exported function.
- Change the `uaString` argument to an injected `ua` argument which is an instance of `new UA()` from `@financial-times/polyfill-useragent-normaliser`.
- Remove `rum` feature

#### [v4.8.0](https://github.com/Financial-Times/polyfill-library/compare/v4.7.0...v4.8.0)

- Add documentation section for AWS Lambda [`#1293`](https://github.com/Financial-Times/polyfill-library/pull/1293)
- Add extra tests for `Array.prototype.sort` [`#1288`](https://github.com/Financial-Times/polyfill-library/pull/1288)
- Add `HTMLFormElement.prototype.requestSubmit` Polyfill [`#1241`](https://github.com/Financial-Times/polyfill-library/pull/1241)
- Serve `isIntersecting` polyfill for chromium based browsers [`#1283`](https://github.com/Financial-Times/polyfill-library/pull/1283)
- Add `change-array-by-copy` polyfills [`b91e288`](https://github.com/Financial-Times/polyfill-library/commit/b91e28855c4d1495ce66d08363f11202becc5be5)
- Add `TypedArray.prototype.sort` polyfill [`bba9e55`](https://github.com/Financial-Times/polyfill-library/commit/bba9e5550b289b85993f46e51a45734bacd02e04)
- Streamline TypedArray polyfills [`8d2cb51`](https://github.com/Financial-Times/polyfill-library/commit/8d2cb51598677c5ad9be36dc781830b06da3e307)

#### [v4.7.0](https://github.com/Financial-Times/polyfill-library/compare/v4.6.0...v4.7.0)

> 6 February 2023

- Adds `structuredClone` polyfill [`#1270`](https://github.com/Financial-Times/polyfill-library/pull/1270)
- Adds `Element.prototype.replaceChildren` polyfill [`#1266`](https://github.com/Financial-Times/polyfill-library/pull/1266)
- Fixes key collisions in internal `Map` storage [`#1275`](https://github.com/Financial-Times/polyfill-library/pull/1275)

#### [v4.6.0](https://github.com/Financial-Times/polyfill-library/compare/v4.5.0...v4.6.0)

- Adds `Error.cause` polyfill [`a613013`](https://github.com/Financial-Times/polyfill-library/commit/a6130130a976418325983852e3d2b0eefa09b1af)
- Adds conditional `Error.cause` to `AggregateError` [`c7a1de7`](https://github.com/Financial-Times/polyfill-library/commit/c7a1de7d89d85da981c6fe1ca4e0f7c24b0cc35b)
- IntersectionObserver: serve to Safari `<17.0` [`#1255`](https://github.com/Financial-Times/polyfill-library/issues/1255)
- update dependencies and update some polyfill configs [`#1248`](https://github.com/Financial-Times/polyfill-library/pull/1248)
- Renames `_InstallErrorCause` to `_ErrorConstructor` [`#1261`](https://github.com/Financial-Times/polyfill-library/pull/1261)
- Fixes `Error` prototype in `_InstallErrorCause` [`#1258`](https://github.com/Financial-Times/polyfill-library/pull/1258)
- Refactors `Error.cause` into `_InstallErrorCause` [`91a4700`](https://github.com/Financial-Times/polyfill-library/commit/91a4700e1cfe59ea331d9c4808d4ceeda51bd6fb)

> 13 January 2023

#### [v4.5.0](https://github.com/Financial-Times/polyfill-library/compare/v4.4.0...v4.5.0)

- IntersectionObserver: serve to Safari `<16.1` [`#1231`](https://github.com/Financial-Times/polyfill-library/pull/1231)
- Adds `findLast` and `findLastIndex` polyfills [`#1230`](https://github.com/Financial-Times/polyfill-library/pull/1230)
- ListFormat: serve to Safari `<16.0` [`#1229`](https://github.com/Financial-Times/polyfill-library/pull/1229)

> 16 August 2022

#### [v4.4.0](https://github.com/Financial-Times/polyfill-library/compare/v4.3.0...v4.4.0)

- Adds `Node.prototype.getRootNode` and `Node.prototype.isConnected` polyfills [`#1223`](https://github.com/Financial-Times/polyfill-library/pull/1223)
- Adds `CharacterData.prototype` polyfills [`#1224`](https://github.com/Financial-Times/polyfill-library/pull/1224)
- Adds `x` and `y` to `IntersectionObserverEntry` [`#1222`](https://github.com/Financial-Times/polyfill-library/pull/1222)
- validate browser configs (part 2) [`#1220`](https://github.com/Financial-Times/polyfill-library/pull/1220)
- Adds polyfill for `Object.hasOwn` [`#1214`](https://github.com/Financial-Times/polyfill-library/pull/1214)
- ensure browser cache when testing polyfill combinations [`#1217`](https://github.com/Financial-Times/polyfill-library/pull/1217)
- Adds polyfill for `Object.prototype.toString` [`#1216`](https://github.com/Financial-Times/polyfill-library/pull/1216)

#### [v4.3.0](https://github.com/Financial-Times/polyfill-library/compare/v4.2.0...v4.3.0)

> 5 August 2022

- Adds polyfills for `TypedArray.prototype` methods [`#1208`](https://github.com/Financial-Times/polyfill-library/pull/1208)
- Adds `Symbol.toStringTag` to several prototypes [`#1187`](https://github.com/Financial-Times/polyfill-library/pull/1187)
- update dependencies [`#1207`](https://github.com/Financial-Times/polyfill-library/pull/1207)
  - update `@webcomponents/template` to `v1.5.0`
  - update `@financial-times/polyfill-useragent-normaliser` to `v2.0.1`

#### [v4.2.0](https://github.com/Financial-Times/polyfill-library/compare/v4.1.1...v4.2.0)

> 28 July 2022

- fix HTMLElement.prototype.inert [`#1201`](https://github.com/Financial-Times/polyfill-library/pull/1201)
- validate browser configs [`#1204`](https://github.com/Financial-Times/polyfill-library/pull/1204)
- fix weekly test suite [`#1200`](https://github.com/Financial-Times/polyfill-library/pull/1200)

#### [v4.1.1](https://github.com/Financial-Times/polyfill-library/compare/v4.1.0...v4.1.1)

> 12 July 2022

- Fixes `TypedArray.prototype.at` to avoid adding `at` to `Object.prototype` [`#1188`](https://github.com/Financial-Times/polyfill-library/pull/1188)
- fix partial tests in CI and use native concurrency control [`#1199`](https://github.com/Financial-Times/polyfill-library/pull/1199)
- serve IntersectionObserver to Safari &lt;16 [`#1197`](https://github.com/Financial-Times/polyfill-library/pull/1197)
- Bump got from 11.5.0 to 11.8.5 [`#1196`](https://github.com/Financial-Times/polyfill-library/pull/1196)
- Adds update task to `ArrayBuffer` to fix incomplete browser implementations [`f27fd4f`](https://github.com/Financial-Times/polyfill-library/commit/f27fd4f9cbe08ec5429f15c13b7b137f21876d9e)
- Uses `Blob` polyfill in all IE for TypedArray support [`e49007b`](https://github.com/Financial-Times/polyfill-library/commit/e49007b2162bcb267f6dadf6c51d4057bf0f4be7)

#### [v4.1.0](https://github.com/Financial-Times/polyfill-library/compare/v4.0.0...v4.1.0)

> 16 May 2022

- Bump async from 3.2.0 to 3.2.3 [`#1181`](https://github.com/Financial-Times/polyfill-library/pull/1181)
- copy-paste eventsource into the codebase, because upstream is punishing the Russian people for the actions of its government [`4fae4d2`](https://github.com/Financial-Times/polyfill-library/commit/4fae4d277330eb2ef55bec7c1e5d1cacc3c86eb1)
- Fixes `HTMLSelectElement.prototype.remove` to include `Element.prototype.remove` [`9a696c2`](https://github.com/Financial-Times/polyfill-library/commit/9a696c2735e9738126028051781e1ba94634d8f6)
- Polyfill for HTMLCollection.prototype.@@iterator [`d614014`](https://github.com/Financial-Times/polyfill-library/commit/d614014740f9be3ef00076005a08471301110e6c)

### [v4.0.0](https://github.com/Financial-Times/polyfill-library/compare/v3.111.0...v4.0.0)

> 1 April 2022

- Drop no longer needed polyfills for IE8 [`d2b6983`](https://github.com/Financial-Times/polyfill-library/commit/d2b6983386c7d72775777498758fcfe7371b8e25)
- Remove all mentions of IE 8 and below [`8e8af1c`](https://github.com/Financial-Times/polyfill-library/commit/8e8af1c9a571fc5ef7e2cf33073c861251da79d0)
- Remove no longer needed `arePropertyDescriptorsSupported` checks [`20cdbb1`](https://github.com/Financial-Times/polyfill-library/commit/20cdbb1db1ef74b2b0346a1e934a9d5a4ebd967e)

#### [v3.111.0](https://github.com/Financial-Times/polyfill-library/compare/v3.110.1...v3.111.0)

> 15 March 2022

- Bump normalize-url from 4.5.0 to 4.5.1 [`#1170`](https://github.com/Financial-Times/polyfill-library/pull/1170)
- Bump glob-parent from 5.1.0 to 5.1.2 [`#1171`](https://github.com/Financial-Times/polyfill-library/pull/1171)
- Bump ws from 7.3.1 to 7.5.7 [`#1172`](https://github.com/Financial-Times/polyfill-library/pull/1172)
- Bump path-parse from 1.0.6 to 1.0.7 [`#1169`](https://github.com/Financial-Times/polyfill-library/pull/1169)
- Bump karma from 6.3.2 to 6.3.16 [`#1165`](https://github.com/Financial-Times/polyfill-library/pull/1165)
- Bump follow-redirects from 1.13.1 to 1.14.9 [`#1166`](https://github.com/Financial-Times/polyfill-library/pull/1166)
- Bump node-fetch from 2.6.1 to 2.6.7 [`#1164`](https://github.com/Financial-Times/polyfill-library/pull/1164)
- URL: Fix URLSearchParams decoding to not throw URIError [`#4`](https://github.com/Financial-Times/polyfill-library/issues/4)
- Improves `localStorage` polyfill to store keys as `base64` [`b89fda3`](https://github.com/Financial-Times/polyfill-library/commit/b89fda30179c518f4011509a54a2b54c97acbc21)
- fix(android): incorect versions for misc features [`273eebd`](https://github.com/Financial-Times/polyfill-library/commit/273eebd7e876740dc26e6a7cff056160f75b710f)
- Enable and document locally running polyfill tests [`e257d89`](https://github.com/Financial-Times/polyfill-library/commit/e257d89906626ca097c987fd1296758d4a2905e9)

#### [v3.110.1](https://github.com/Financial-Times/polyfill-library/compare/v3.110.0...v3.110.1)

> 8 December 2021

- Use the private _setter and _getter methods for TypedArrays when in IE8 because we can't use add square-bracket notation support due to the lack of getters and setters in IE8 [`ab4868c`](https://github.com/Financial-Times/polyfill-library/commit/ab4868cd7742e2eb5e9262b7a48e540290d9bc5e)
- Adds `Node.prototype.isSameNode` polyfill [`372d401`](https://github.com/Financial-Times/polyfill-library/commit/372d401bbdd60989d32e895657068ae8a086ac54)
- fix arraybuffer polyfill to not error in ie8 [`95d1b47`](https://github.com/Financial-Times/polyfill-library/commit/95d1b47c393fa8cf3e978b8820de8014623ea79f)

#### [v3.110.0](https://github.com/Financial-Times/polyfill-library/compare/v3.109.0...v3.110.0)

> 7 December 2021

- use an object which has no prototype so that the only properties on the object are it's own and not those from Object.prototype -- Fixes #1137 [`#1137`](https://github.com/Financial-Times/polyfill-library/issues/1137)
- Adds `Promise.any`, `Promise.allSettled`, and `AggregateError` polyfills [`21967a1`](https://github.com/Financial-Times/polyfill-library/commit/21967a1973ea70930062fc2837c2c8aec28cdb01)
- Adds `Array.prototype.at`, `String.prototype.at`, and `TypedArray.prototype.at` polyfills [`29c6814`](https://github.com/Financial-Times/polyfill-library/commit/29c6814f885bc80a0f289c6932bd6340d7f00951)
- Improves iterator tests for `Promise.any`, `Promise.allSettled`, and `AggregateError` polyfills [`999dbce`](https://github.com/Financial-Times/polyfill-library/commit/999dbce7a3be7d85938c45c79285c2c9888d8799)

#### [v3.109.0](https://github.com/Financial-Times/polyfill-library/compare/v3.108.0...v3.109.0)

> 11 November 2021

- fix #1103 [`#1103`](https://github.com/Financial-Times/polyfill-library/issues/1103)
- chore: update browserstack browser list as some devices have been removed such as the Samsung Galaxy Note 4 that we tested on [`bab4728`](https://github.com/Financial-Times/polyfill-library/commit/bab4728bd1d7b3fae6b66c5dd1da6c9943c262c4)
- Adds `String.prototype.matchAll` polyfill [`cdf20a6`](https://github.com/Financial-Times/polyfill-library/commit/cdf20a650e8a1d0b1eec44f842f41d51a46be2a7)
- add check for valid version ranges in config.toml [`368fd05`](https://github.com/Financial-Times/polyfill-library/commit/368fd051a252583421d96d6f5832094ab877b211)

#### [v3.108.0](https://github.com/Financial-Times/polyfill-library/compare/v3.107.1...v3.108.0)

> 7 September 2021

- update Intl.* config's. fixes #1094 [`#1094`](https://github.com/Financial-Times/polyfill-library/issues/1094)
- Serve IntersectionObserver to all iOS Safari versions [`#1082`](https://github.com/Financial-Times/polyfill-library/issues/1082)
- Update guidate for Intl.PluralRules to mention locales have no subtags [`#650`](https://github.com/Financial-Times/polyfill-library/issues/650)
- skip older IE for WPT tests [`3bb57e4`](https://github.com/Financial-Times/polyfill-library/commit/3bb57e44a6792fe1ac7691d9f2d00744d56c0f2e)
- add more tests and a few more EventTarget interface features [`c844665`](https://github.com/Financial-Times/polyfill-library/commit/c844665fa83c6dfb64d34e04537de9f87c9b8a83)
- fixes [`dca1723`](https://github.com/Financial-Times/polyfill-library/commit/dca17234127368070918e3b0ee8c3298c5da97ac)

#### [v3.107.1](https://github.com/Financial-Times/polyfill-library/compare/v3.107.0...v3.107.1)

> 21 July 2021

- ensure node 12 is used when publishing [`#1074`](https://github.com/Financial-Times/polyfill-library/pull/1074)
- add timeZone data in all browsers that need Intl.DateTimeFormat [`b3a9a6f`](https://github.com/Financial-Times/polyfill-library/commit/b3a9a6f0ecdb33202c1a689da52935c33ee3a478)
- document that compatiblity list should stay in sync [`ffdedb0`](https://github.com/Financial-Times/polyfill-library/commit/ffdedb000b72603c17b05c9cb2566ba3c00aa136)

#### [v3.107.0](https://github.com/Financial-Times/polyfill-library/compare/v3.106.0...v3.107.0)

> 20 July 2021

- Serve `URL.prototype.toJSON` to Safari &lt;12 and Edge &lt;18.17134 [`#1058`](https://github.com/Financial-Times/polyfill-library/pull/1058)
- fix URL / fetch interop [`df1aa52`](https://github.com/Financial-Times/polyfill-library/commit/df1aa52b101250d7fd992acfc3b42d6180b9ac27)
- update compat data based on mdn [`113e18d`](https://github.com/Financial-Times/polyfill-library/commit/113e18d5ceb9724af68a8b3fadec9193ff9c1c00)
- Add compatibility data for ArrayBuffer [`ff90e85`](https://github.com/Financial-Times/polyfill-library/commit/ff90e8554a628e32ff2ce6318ecd528e38fddeb0)

#### [v3.106.0](https://github.com/Financial-Times/polyfill-library/compare/v3.105.0...v3.106.0)

> 12 July 2021

- Intl dependency config update [`#1059`](https://github.com/Financial-Times/polyfill-library/pull/1059)
- fix #957 : remove StreamCache [`#957`](https://github.com/Financial-Times/polyfill-library/issues/957)
- add editorconfig and update all files to conform with the config [`5542481`](https://github.com/Financial-Times/polyfill-library/commit/554248173eae7554ef0a7776549d2901f02a7d51)
- update [`170d416`](https://github.com/Financial-Times/polyfill-library/commit/170d416460ef7ae4c966d9b437abbad92134d619)
- Intl.DateTimeFormat add timeZone data [`f44fbe2`](https://github.com/Financial-Times/polyfill-library/commit/f44fbe2de9fd1f0f30f19afee86f7b8b711b86de)

#### [v3.105.0](https://github.com/Financial-Times/polyfill-library/compare/v3.104.0...v3.105.0)

> 7 May 2021

- Bump eslint from 7.24.0 to 7.25.0 [`#1039`](https://github.com/Financial-Times/polyfill-library/pull/1039)
- Bump actions/cache from v2.1.4 to v2.1.5 [`#1037`](https://github.com/Financial-Times/polyfill-library/pull/1037)
- Bump eslint from 7.23.0 to 7.24.0 [`#1034`](https://github.com/Financial-Times/polyfill-library/pull/1034)
- Bump styfle/cancel-workflow-action [`#1035`](https://github.com/Financial-Times/polyfill-library/pull/1035)
- Bump sinon from 10.0.0 to 10.0.1 [`#1033`](https://github.com/Financial-Times/polyfill-library/pull/1033)
- Bump karma from 6.3.1 to 6.3.2 [`#1030`](https://github.com/Financial-Times/polyfill-library/pull/1030)
- Bump eslint from 7.22.0 to 7.23.0 [`#1028`](https://github.com/Financial-Times/polyfill-library/pull/1028)
- Bump karma from 6.2.0 to 6.3.1 [`#1026`](https://github.com/Financial-Times/polyfill-library/pull/1026)
- Bump semver from 7.3.4 to 7.3.5 [`#1025`](https://github.com/Financial-Times/polyfill-library/pull/1025)
- Bump globby from 11.0.2 to 11.0.3 [`#1024`](https://github.com/Financial-Times/polyfill-library/pull/1024)
- Bump sinon from 9.2.4 to 10.0.0 [`#1023`](https://github.com/Financial-Times/polyfill-library/pull/1023)
- build(deps): npm audit fix [`329b48a`](https://github.com/Financial-Times/polyfill-library/commit/329b48ac5308fe58dad10fe4a8700b6583b0d877)
- HTMLInputElement.prototype.valueAsDate [`e2dc393`](https://github.com/Financial-Times/polyfill-library/commit/e2dc3933479d3d85386183f117cfc9d9f7add04d)
- URLSearchParams : [err] keys is not a function [`7966b2e`](https://github.com/Financial-Times/polyfill-library/commit/7966b2e240a2582cb4264128d7c7f027bb359b42)

#### [v3.104.0](https://github.com/Financial-Times/polyfill-library/compare/v3.103.0...v3.104.0)

> 19 March 2021

- Bump hmarr/auto-approve-action [`#1019`](https://github.com/Financial-Times/polyfill-library/pull/1019)
- Bump eslint from 7.18.0 to 7.21.0 [`#1010`](https://github.com/Financial-Times/polyfill-library/pull/1010)
- Bump karma from 6.0.1 to 6.1.1 [`#1009`](https://github.com/Financial-Times/polyfill-library/pull/1009)
- Bump fs-extra from 9.0.1 to 9.1.0 [`#1008`](https://github.com/Financial-Times/polyfill-library/pull/1008)
- Bump handlebars from 4.7.6 to 4.7.7 [`#1007`](https://github.com/Financial-Times/polyfill-library/pull/1007)
- Bump lodash from 4.17.20 to 4.17.21 [`#1003`](https://github.com/Financial-Times/polyfill-library/pull/1003)
- Bump apicache from 1.5.3 to 1.6.2 [`#1000`](https://github.com/Financial-Times/polyfill-library/pull/1000)
- Bump actions/setup-node from v2.1.4 to v2.1.5 [`#999`](https://github.com/Financial-Times/polyfill-library/pull/999)
- Serve Intl.DateTimeFormat polyfill to all Firefox versions [`#1012`](https://github.com/Financial-Times/polyfill-library/issues/1012)
- Do not run tests on android versions which use the latest version of chrome [`#1004`](https://github.com/Financial-Times/polyfill-library/issues/1004)
- chore: upgrade formatjs packages [`ec26e58`](https://github.com/Financial-Times/polyfill-library/commit/ec26e5818bdb418ab9c2538bcee18367af2185d7)
- update to latest browserstack browsers to test against [`84170ee`](https://github.com/Financial-Times/polyfill-library/commit/84170ee7e8a2f8b22e8091a53c20c6038d888d9f)
- partial tests in ci [`85df0e2`](https://github.com/Financial-Times/polyfill-library/commit/85df0e2782345d1c4a09c62c79df4536bd8bf4e5)

#### [v3.103.0](https://github.com/Financial-Times/polyfill-library/compare/v3.102.0...v3.103.0)

> 17 January 2021

- Bump karma from 5.2.3 to 6.0.0 [`6d874ea`](https://github.com/Financial-Times/polyfill-library/commit/6d874ea2e28e3c8ea6556085cfa5a239f5f6057e)
- Bump eslint-plugin-unicorn from 26.0.0 to 26.0.1 [`87c5d81`](https://github.com/Financial-Times/polyfill-library/commit/87c5d81858aa7388b861f804e7c5ee19154f8ad3)
- Update config.toml [`fd45de2`](https://github.com/Financial-Times/polyfill-library/commit/fd45de27ac42fcb80042b82cce688bd84c233d20)

#### [v3.102.0](https://github.com/Financial-Times/polyfill-library/compare/v3.101.0...v3.102.0)

> 13 January 2021

- chore: upgrade formatjs packages [`8e8c20e`](https://github.com/Financial-Times/polyfill-library/commit/8e8c20eb86b074e4b584a0c70a65664c7dad4e22)
- Bump globby from 11.0.1 to 11.0.2 [`0811be8`](https://github.com/Financial-Times/polyfill-library/commit/0811be82f04c3bb891d040f3b3c37ba130dde79f)
- Refactor away usage of reduce [`708e209`](https://github.com/Financial-Times/polyfill-library/commit/708e209d714cd3007f656f85e1c9506d5a8323c0)

#### [v3.101.0](https://github.com/Financial-Times/polyfill-library/compare/v3.100.0...v3.101.0)

> 6 January 2021

- chore: upgrade formatjs packages, fix #958 [`#958`](https://github.com/Financial-Times/polyfill-library/issues/958)
- convert CI to matrix and witness checks [`309e740`](https://github.com/Financial-Times/polyfill-library/commit/309e740db3a4364f45acea712197481694b3a590)
- Bump eslint from 7.15.0 to 7.16.0 [`907b38a`](https://github.com/Financial-Times/polyfill-library/commit/907b38a6f551e4a6f048eb7bb7a22c7f1e9ae23c)
- compress test server responses and add more pauses [`cdf19c5`](https://github.com/Financial-Times/polyfill-library/commit/cdf19c5aacadff3f268a6e8554ea3a780541f1ea)

#### [v3.100.0](https://github.com/Financial-Times/polyfill-library/compare/v3.99.0...v3.100.0)

> 15 December 2020

- update polyfill configs for edge 79 + a few corrections [`96e0eb8`](https://github.com/Financial-Times/polyfill-library/commit/96e0eb821065fa2d3904180a4039bda0e00f9f77)
- Bump sinon from 9.2.1 to 9.2.2 [`d20dae9`](https://github.com/Financial-Times/polyfill-library/commit/d20dae98c958eb3e54ffb8e6c3c8dcd87a817c36)
- Bump browserstack from 1.6.0 to 1.6.1 [`442bbf6`](https://github.com/Financial-Times/polyfill-library/commit/442bbf6cda3cd0c93ca978c6a27bfec382c3e6fa)

#### [v3.99.0](https://github.com/Financial-Times/polyfill-library/compare/v3.98.0...v3.99.0)

> 12 December 2020

- fix Symbol.prototype.description [`#935`](https://github.com/Financial-Times/polyfill-library/pull/935)
- isolate test runs with and without polyfill combinations [`#929`](https://github.com/Financial-Times/polyfill-library/pull/929)
- Bump execa from 4.1.0 to 5.0.0 [`#922`](https://github.com/Financial-Times/polyfill-library/pull/922)
- Object fixes [`e8f54fb`](https://github.com/Financial-Times/polyfill-library/commit/e8f54fbf8b4dc6bb41beaee3d8c8e101fb345d07)
- Bump eslint from 7.14.0 to 7.15.0 [`f1f2830`](https://github.com/Financial-Times/polyfill-library/commit/f1f2830cfed9d5cbc993763d33cfb941841836d9)
- fix StringIndexOf [`e4affbd`](https://github.com/Financial-Times/polyfill-library/commit/e4affbdec6c1cd1599ad5dab637233ebc93ca6fc)

#### [v3.98.0](https://github.com/Financial-Times/polyfill-library/compare/v3.97.0...v3.98.0)

> 3 December 2020

- Serve DOMRect polyfill to Edge versions &lt; 79 [`#921`](https://github.com/Financial-Times/polyfill-library/pull/921)
- chore: upgrade formatjs libs + add Intl.Locale polyfill [`#913`](https://github.com/Financial-Times/polyfill-library/pull/913)
- bump eslint [`eb387d5`](https://github.com/Financial-Times/polyfill-library/commit/eb387d52cf2aea91c693a886f939fd963ec2c7b4)
- rewrite Symbol.prototype.description polyfill so it passes tests [`9e22916`](https://github.com/Financial-Times/polyfill-library/commit/9e2291619d02a6723389928580475f69451640db)
- Bump array.prototype.flatmap from 1.2.3 to 1.2.4 [`fe0d1ec`](https://github.com/Financial-Times/polyfill-library/commit/fe0d1ec3b3e7250fcd3b1adcd526913479583da9)

#### [v3.97.0](https://github.com/Financial-Times/polyfill-library/compare/v3.96.0...v3.97.0)

> 29 October 2020

- Bump event-source-polyfill from 1.0.12 to 1.0.17 [`#843`](https://github.com/Financial-Times/polyfill-library/pull/843)
- chore: upgrade formatjs deps, fix #886 [`#886`](https://github.com/Financial-Times/polyfill-library/issues/886)
- upgrade packages and fix tests [`6af14fc`](https://github.com/Financial-Times/polyfill-library/commit/6af14fcb7508b3d5fbce1aaf38adcdec531df6f4)
- Remove dangling commas as they are not valid in ES3 syntax [`709b09f`](https://github.com/Financial-Times/polyfill-library/commit/709b09f40bdc359ae2650fe815ca5adbe5c0912f)
- fix: rm generated polyfill file, consolidate ignore files [`b8c30bc`](https://github.com/Financial-Times/polyfill-library/commit/b8c30bc47c32d79213c2f14369d0dad8eb0c78d9)

#### [v3.96.0](https://github.com/Financial-Times/polyfill-library/compare/v3.95.0...v3.96.0)

> 21 August 2020

- Bump karma from 4.4.1 to 5.1.1 [`#822`](https://github.com/Financial-Times/polyfill-library/pull/822)
- Add en locale to Intl alias - fixes #676 [`#818`](https://github.com/Financial-Times/polyfill-library/pull/818)
- Bump yaku from 0.19.3 to 1.0.1 [`#819`](https://github.com/Financial-Times/polyfill-library/pull/819)
- Bump browserstack from 1.5.3 to 1.6.0 [`#821`](https://github.com/Financial-Times/polyfill-library/pull/821)
- Bump mkdirp from 0.5.5 to 1.0.4 [`#820`](https://github.com/Financial-Times/polyfill-library/pull/820)
- Bump lodash from 4.17.19 to 4.17.20 [`#814`](https://github.com/Financial-Times/polyfill-library/pull/814)
- Bump mutationobserver-shim from 0.3.5 to 0.3.7 [`#807`](https://github.com/Financial-Times/polyfill-library/pull/807)
- Add en locale to Intl alias - fixes #676 (#818) [`#676`](https://github.com/Financial-Times/polyfill-library/issues/676)
- fix: fix Intl alias for locale-data, fix #770 [`#770`](https://github.com/Financial-Times/polyfill-library/issues/770)
- Fix JSDoc for setHashIndex [`#714`](https://github.com/Financial-Times/polyfill-library/issues/714)
- Revert "feat: upgrade Intl polyfills & add Chromium bug detection for Intl.DisplayNames" [`5a80f81`](https://github.com/Financial-Times/polyfill-library/commit/5a80f8109029b5c00da50930765b61779b98f412)
- feat: upgrade Intl polyfills & add Chromium bug detection for Intl.DisplayNames [`d869a01`](https://github.com/Financial-Times/polyfill-library/commit/d869a016a68250b21ca65043a54fdfb3cd965c25)
- Bump nyc from 15.0.0 to 15.1.0 [`3d36d0d`](https://github.com/Financial-Times/polyfill-library/commit/3d36d0df666f0e3e1e7bf272b0f88d7bd17f4990)

#### [v3.95.0](https://github.com/Financial-Times/polyfill-library/compare/v3.94.0...v3.95.0)

> 1 July 2020

- feat: Add @formatjs/intl-datetimeformat, remove legacy Intl.js [`788743a`](https://github.com/Financial-Times/polyfill-library/commit/788743a509d50b0c0e7f6497e25014a338511bf4)
- Fix formatting issues in Intl tests [`576e581`](https://github.com/Financial-Times/polyfill-library/commit/576e5816d8de523b4db120d3eab9f71bf70e0b65)
- simplify linting test files [`a62d207`](https://github.com/Financial-Times/polyfill-library/commit/a62d2079383d6296f0917453ca14a3ed6bbd9ffb)

#### [v3.94.0](https://github.com/Financial-Times/polyfill-library/compare/v3.93.0...v3.94.0)

> 12 June 2020

- Bump eslint-plugin-unicorn from 17.2.0 to 19.0.1 [`#655`](https://github.com/Financial-Times/polyfill-library/pull/655)
- Bump webdriverio from 5.18.7 to 6.1.14 [`#654`](https://github.com/Financial-Times/polyfill-library/pull/654)
- Add Github Action to auto approve dependabot [`#653`](https://github.com/Financial-Times/polyfill-library/pull/653)
- Auto merge dependabot dev dependency PRs [`#652`](https://github.com/Financial-Times/polyfill-library/pull/652)
- feat: Add Intl.ListFormat polyfill [`#641`](https://github.com/Financial-Times/polyfill-library/pull/641)
- Bump yaml from 1.7.2 to 1.10.0 [`#645`](https://github.com/Financial-Times/polyfill-library/pull/645)
- Bump execa from 4.0.0 to 4.0.1 [`#643`](https://github.com/Financial-Times/polyfill-library/pull/643)
- Bump mutationobserver-shim from 0.3.3 to 0.3.5 [`#638`](https://github.com/Financial-Times/polyfill-library/pull/638)
- build(deps): npm audit fix [`#640`](https://github.com/Financial-Times/polyfill-library/pull/640)
- Use seamless-scroll-polyfill for smoothscroll [`#657`](https://github.com/Financial-Times/polyfill-library/issues/657)
- feat: Add Intl.getCanonicalLocales polyfill [`5a14527`](https://github.com/Financial-Times/polyfill-library/commit/5a14527b2a1ebf2b192c205338abbd9a549b536e)
- Add basic resize observer tests [`10b2656`](https://github.com/Financial-Times/polyfill-library/commit/10b2656cd06e3e213420ebe3ded811fee8cfa62d)
- feat: Add Intl.NumberFormat ES2020 polyfill [`e93e0cf`](https://github.com/Financial-Times/polyfill-library/commit/e93e0cf730e4a960efa5ab4ee581b09f462c4d2b)

#### [v3.93.0](https://github.com/Financial-Times/polyfill-library/compare/v3.92.0...v3.93.0)

> 14 May 2020

- Bump @webcomponents/template from 1.4.1 to 1.4.2 [`#635`](https://github.com/Financial-Times/polyfill-library/pull/635)
- Polyfill Intl.PluralRules on Edge &lt;18 [`#634`](https://github.com/Financial-Times/polyfill-library/pull/634)
- Bump graceful-fs from 4.2.3 to 4.2.4 [`#632`](https://github.com/Financial-Times/polyfill-library/pull/632)
- Bump sinon from 9.0.0 to 9.0.2 [`#631`](https://github.com/Financial-Times/polyfill-library/pull/631)
- Update unit-test.yml [`f68f201`](https://github.com/Financial-Times/polyfill-library/commit/f68f201d9bcbc6d73f7ae9674137b70abb140a6f)
- Update test-polyfills.yml [`ffc2736`](https://github.com/Financial-Times/polyfill-library/commit/ffc27366dde1c63e37581f8315ad128f83f8611c)

#### [v3.92.0](https://github.com/Financial-Times/polyfill-library/compare/v3.91.0...v3.92.0)

> 12 May 2020

- update edge targeting for polyfills/UserTiming/config.toml [`#594`](https://github.com/Financial-Times/polyfill-library/pull/594)

#### [v3.91.0](https://github.com/Financial-Times/polyfill-library/compare/v3.90.0...v3.91.0)

> 11 May 2020

- update firefox targeting for polyfills/console/timeStamp/config.toml [`#615`](https://github.com/Financial-Times/polyfill-library/pull/615)

#### [v3.90.0](https://github.com/Financial-Times/polyfill-library/compare/v3.89.4...v3.90.0)

> 11 May 2020

- update firefox targeting for polyfills/console/timelineEnd/config.toml [`#617`](https://github.com/Financial-Times/polyfill-library/pull/617)
- chore(deps): npm audit fix [`97f9ba4`](https://github.com/Financial-Times/polyfill-library/commit/97f9ba4a3220f8dec9a480cbe360b04fbcee7ffd)
- Create npm-audit-fix.yml [`7dc86cd`](https://github.com/Financial-Times/polyfill-library/commit/7dc86cdde4b90f3d1ca87294f177486e6e0bbf12)
- update lockfile [`8e1574b`](https://github.com/Financial-Times/polyfill-library/commit/8e1574be38fd3894bfa4c40bf20630bbb1637a5d)

#### [v3.89.4](https://github.com/Financial-Times/polyfill-library/compare/v3.89.3...v3.89.4)

> 21 April 2020

- matchMedia : new test for 'addListener' [`98e34bf`](https://github.com/Financial-Times/polyfill-library/commit/98e34bfd2bcde4484c1231a41e8590af71dc0f95)
- Mention that to test in BrowserStack requires a BrowserStack account [`64632f7`](https://github.com/Financial-Times/polyfill-library/commit/64632f7e7e9e740ec5a608df0a9085d31a1656a0)
- Revert fde245bc744c21426fe45833d2a6079665421bfd [`58b0dda`](https://github.com/Financial-Times/polyfill-library/commit/58b0ddad5ee63cde1712ca3d142e05338e730d82)

#### [v3.89.3](https://github.com/Financial-Times/polyfill-library/compare/v3.89.2...v3.89.3)

> 20 April 2020

- Add missing listeners array on mql instances [`#623`](https://github.com/Financial-Times/polyfill-library/issues/623)

#### [v3.89.2](https://github.com/Financial-Times/polyfill-library/compare/v3.89.1...v3.89.2)

> 20 April 2020

- Add test for https://github.com/Financial-Times/polyfill-library/issues/125 [`dcf957a`](https://github.com/Financial-Times/polyfill-library/commit/dcf957a3804e11c9ee838f20963641d30962b43d)

#### [v3.89.1](https://github.com/Financial-Times/polyfill-library/compare/v3.89.0...v3.89.1)

> 20 April 2020

- Add CSS.supports polyfill [`#569`](https://github.com/Financial-Times/polyfill-library/pull/569)
- Fix https://github.com/Financial-Times/polyfill-library/issues/43 [`#43`](https://github.com/Financial-Times/polyfill-library/issues/43)
- Add test for https://github.com/Financial-Times/polyfill-library/issues/43 [`52af42e`](https://github.com/Financial-Times/polyfill-library/commit/52af42eae73dff6c0b3eceec6a2ecf104b2592b2)
- ignore only [`cc0c6e7`](https://github.com/Financial-Times/polyfill-library/commit/cc0c6e7af54ef59aaba89ea54dfe8b73137f01ca)

#### [v3.89.0](https://github.com/Financial-Times/polyfill-library/compare/v3.88.0...v3.89.0)

> 19 April 2020

- update firefox targeting for polyfills/WeakMap/config.toml [`#610`](https://github.com/Financial-Times/polyfill-library/pull/610)

#### [v3.88.0](https://github.com/Financial-Times/polyfill-library/compare/v3.87.0...v3.88.0)

> 18 April 2020

- update firefox targeting for polyfills/WeakSet/config.toml [`#611`](https://github.com/Financial-Times/polyfill-library/pull/611)

#### [v3.87.0](https://github.com/Financial-Times/polyfill-library/compare/v3.86.0...v3.87.0)

> 18 April 2020

- update firefox targeting for polyfills/console/markTimeline/config.toml [`#614`](https://github.com/Financial-Times/polyfill-library/pull/614)

#### [v3.86.0](https://github.com/Financial-Times/polyfill-library/compare/v3.85.0...v3.86.0)

> 18 April 2020

- update firefox targeting for polyfills/Symbol/split/config.toml [`#606`](https://github.com/Financial-Times/polyfill-library/pull/606)

#### [v3.85.0](https://github.com/Financial-Times/polyfill-library/compare/v3.84.0...v3.85.0)

> 18 April 2020

- update firefox targeting for polyfills/Symbol/unscopables/config.toml [`#608`](https://github.com/Financial-Times/polyfill-library/pull/608)

#### [v3.84.0](https://github.com/Financial-Times/polyfill-library/compare/v3.83.0...v3.84.0)

> 18 April 2020

- update firefox targeting for polyfills/console/clear/config.toml [`#612`](https://github.com/Financial-Times/polyfill-library/pull/612)

#### [v3.83.0](https://github.com/Financial-Times/polyfill-library/compare/v3.82.0...v3.83.0)

> 17 April 2020

- update firefox targeting for polyfills/console/dirxml/config.toml [`#613`](https://github.com/Financial-Times/polyfill-library/pull/613)

#### [v3.82.0](https://github.com/Financial-Times/polyfill-library/compare/v3.81.0...v3.82.0)

> 17 April 2020

- update firefox targeting for polyfills/console/timeline/config.toml [`#616`](https://github.com/Financial-Times/polyfill-library/pull/616)

#### [v3.81.0](https://github.com/Financial-Times/polyfill-library/compare/v3.80.0...v3.81.0)

> 17 April 2020

- update firefox targeting for polyfills/Symbol/species/config.toml [`#605`](https://github.com/Financial-Times/polyfill-library/pull/605)

#### [v3.80.0](https://github.com/Financial-Times/polyfill-library/compare/v3.79.0...v3.80.0)

> 17 April 2020

- update firefox targeting for polyfills/Symbol/toPrimitive/config.toml [`#607`](https://github.com/Financial-Times/polyfill-library/pull/607)

#### [v3.79.0](https://github.com/Financial-Times/polyfill-library/compare/v3.78.0...v3.79.0)

> 17 April 2020

- update firefox targeting for polyfills/Symbol/search/config.toml [`ee0fc5d`](https://github.com/Financial-Times/polyfill-library/commit/ee0fc5daf59845aa9ba45ac76d9d2470ecd25643)

#### [v3.78.0](https://github.com/Financial-Times/polyfill-library/compare/v3.77.0...v3.78.0)

> 17 April 2020

- update chrome targeting for polyfills/Symbol/species/config.toml [`a55a2a0`](https://github.com/Financial-Times/polyfill-library/commit/a55a2a09e1a2afc345ed49272f5de8d56e33c315)

#### [v3.77.0](https://github.com/Financial-Times/polyfill-library/compare/v3.76.0...v3.77.0)

> 17 April 2020

- update chrome targeting for polyfills/Symbol/toPrimitive/config.toml [`3575571`](https://github.com/Financial-Times/polyfill-library/commit/35755717fe30acb2893c82ee3fc731afc16fa985)

#### [v3.76.0](https://github.com/Financial-Times/polyfill-library/compare/v3.75.0...v3.76.0)

> 17 April 2020

- update chrome targeting for polyfills/Symbol/unscopables/config.toml [`965aa1d`](https://github.com/Financial-Times/polyfill-library/commit/965aa1db90f62e3180268330c72d6063b1a127a0)

#### [v3.75.0](https://github.com/Financial-Times/polyfill-library/compare/v3.74.0...v3.75.0)

> 17 April 2020

- update chrome targeting for polyfills/URL/config.toml [`8ed0c92`](https://github.com/Financial-Times/polyfill-library/commit/8ed0c92747f92bc7b67652f1271df12e020dfc85)

#### [v3.74.0](https://github.com/Financial-Times/polyfill-library/compare/v3.73.0...v3.74.0)

> 17 April 2020

- update chrome targeting for polyfills/WeakMap/config.toml [`16be475`](https://github.com/Financial-Times/polyfill-library/commit/16be475b6fa9b3c8ea7919517277f24e05df1bc2)

#### [v3.73.0](https://github.com/Financial-Times/polyfill-library/compare/v3.72.0...v3.73.0)

> 17 April 2020

- update chrome targeting for polyfills/WeakSet/config.toml [`f9c76ba`](https://github.com/Financial-Times/polyfill-library/commit/f9c76bac1274b7d5c6c054f666e64b4ba46bf0d4)

#### [v3.72.0](https://github.com/Financial-Times/polyfill-library/compare/v3.71.0...v3.72.0)

> 16 April 2020

- update chrome targeting for polyfills/console/markTimeline/config.toml [`e727508`](https://github.com/Financial-Times/polyfill-library/commit/e72750865ea13d4f92ccb3c7a980429d5a6a42be)

#### [v3.71.0](https://github.com/Financial-Times/polyfill-library/compare/v3.70.0...v3.71.0)

> 16 April 2020

- update chrome targeting for polyfills/console/time/config.toml [`8b31b54`](https://github.com/Financial-Times/polyfill-library/commit/8b31b549dc6b2f1a62911fae5fbaa5ab34f390e4)
- Update update-polyfill-targets.yml [`a2a2220`](https://github.com/Financial-Times/polyfill-library/commit/a2a2220e1ab33fe7f7a8b0169367a7590cd3ada4)

#### [v3.70.0](https://github.com/Financial-Times/polyfill-library/compare/v3.69.0...v3.70.0)

> 16 April 2020

- update edge targeting for polyfills/console/timelineEnd/config.toml [`9a42e7c`](https://github.com/Financial-Times/polyfill-library/commit/9a42e7cf06e0147f43ebeb6d1533665d55d841cf)

#### [v3.69.0](https://github.com/Financial-Times/polyfill-library/compare/v3.68.0...v3.69.0)

> 16 April 2020

- update edge targeting for polyfills/console/timeline/config.toml [`c5590a7`](https://github.com/Financial-Times/polyfill-library/commit/c5590a718ac64947be91d6e8c8275d03971e06a6)

#### [v3.68.0](https://github.com/Financial-Times/polyfill-library/compare/v3.67.0...v3.68.0)

> 16 April 2020

- update edge targeting for polyfills/console/timeStamp/config.toml [`fb5de44`](https://github.com/Financial-Times/polyfill-library/commit/fb5de44df94f4acbec5e1a5f373e00f1dd61eba5)

#### [v3.67.0](https://github.com/Financial-Times/polyfill-library/compare/v3.66.0...v3.67.0)

> 16 April 2020

- update edge targeting for polyfills/console/markTimeline/config.toml [`8bc5bee`](https://github.com/Financial-Times/polyfill-library/commit/8bc5bee9b9196349689ab62b601428b73fa6a58b)

#### [v3.66.0](https://github.com/Financial-Times/polyfill-library/compare/v3.65.0...v3.66.0)

> 16 April 2020

- update edge targeting for polyfills/URL/config.toml [`65fa6e3`](https://github.com/Financial-Times/polyfill-library/commit/65fa6e3a52aa2eb765da637c476b8530a9cbf17a)

#### [v3.65.0](https://github.com/Financial-Times/polyfill-library/compare/v3.64.0...v3.65.0)

> 15 April 2020

- update edge targeting for polyfills/Symbol/replace/config.toml [`302c01c`](https://github.com/Financial-Times/polyfill-library/commit/302c01cb56c701f694ede831edf17a51fcdbfa5b)
- update chrome targeting for polyfills/screen/orientation/config.toml [`3e8b4a7`](https://github.com/Financial-Times/polyfill-library/commit/3e8b4a784f62089dcba5a3a3c70743a4b9c81643)

#### [v3.64.0](https://github.com/Financial-Times/polyfill-library/compare/v3.63.0...v3.64.0)

> 15 April 2020

- update chrome targeting for polyfills/requestIdleCallback/config.toml [`fde245b`](https://github.com/Financial-Times/polyfill-library/commit/fde245bc744c21426fe45833d2a6079665421bfd)

#### [v3.63.0](https://github.com/Financial-Times/polyfill-library/compare/v3.62.0...v3.63.0)

> 15 April 2020

- catch exception when polyfill file doesn't exist [`dbbdaf2`](https://github.com/Financial-Times/polyfill-library/commit/dbbdaf2d4daee5ca222b12615210d3b7b758e12b)
- update chrome targeting for polyfills/matchMedia/config.toml [`5aa33a8`](https://github.com/Financial-Times/polyfill-library/commit/5aa33a8a782a61cca6fa9ecafa2d47bf8c118aa4)
- Update sources.js [`f21ad6c`](https://github.com/Financial-Times/polyfill-library/commit/f21ad6ca6a061042b53339d2519030bc995918b1)

#### [v3.62.0](https://github.com/Financial-Times/polyfill-library/compare/v3.61.0...v3.62.0)

> 15 April 2020

- update chrome targeting for polyfills/location/origin/config.toml [`a5acbc8`](https://github.com/Financial-Times/polyfill-library/commit/a5acbc81bc995cd16c7a6b092487af23d04adc15)

#### [v3.61.0](https://github.com/Financial-Times/polyfill-library/compare/v3.60.0...v3.61.0)

> 15 April 2020

- update chrome targeting for polyfills/console/timelineEnd/config.toml [`da313a5`](https://github.com/Financial-Times/polyfill-library/commit/da313a5647d2e21188a60853d1a512311aa0c7d3)

#### [v3.60.0](https://github.com/Financial-Times/polyfill-library/compare/v3.59.0...v3.60.0)

> 15 April 2020

- update chrome targeting for polyfills/console/timeline/config.toml [`3894bd2`](https://github.com/Financial-Times/polyfill-library/commit/3894bd223411379d15005098b27edb1cc30b04af)

#### [v3.59.0](https://github.com/Financial-Times/polyfill-library/compare/v3.58.0...v3.59.0)

> 15 April 2020

- Update lint.yml [`ec00028`](https://github.com/Financial-Times/polyfill-library/commit/ec00028e1f96622741453f02b1b377aec8b32050)
- Update unit-test.yml [`ce007b4`](https://github.com/Financial-Times/polyfill-library/commit/ce007b4afa562cf07e2c2b031d825359f350a85f)
- update chrome targeting for polyfills/requestAnimationFrame/config.toml [`a26d38a`](https://github.com/Financial-Times/polyfill-library/commit/a26d38ababf56a0276d42bc67e63cb64996609da)

#### [v3.58.0](https://github.com/Financial-Times/polyfill-library/compare/v3.57.0...v3.58.0)

> 15 April 2020

- update android targeting for polyfills/console/timeline/config.toml [`c5dc1bd`](https://github.com/Financial-Times/polyfill-library/commit/c5dc1bd1dc6fc25fe46ac6cdff0e636574154c5d)

#### [v3.57.0](https://github.com/Financial-Times/polyfill-library/compare/v3.56.3...v3.57.0)

> 15 April 2020

- Update update-polyfill-targets.yml [`3f7bda9`](https://github.com/Financial-Times/polyfill-library/commit/3f7bda9311970d3f2f6945592af9c55a6bedbdb0)
- TypeScript typings, small documentation changes [`ff86a3f`](https://github.com/Financial-Times/polyfill-library/commit/ff86a3f2632d2cd69cc7bf47af5e1790d2c754fa)
- Delete index.d.ts [`7cdec74`](https://github.com/Financial-Times/polyfill-library/commit/7cdec74f1400ce32e8f67bd5f4cf1b8f96ff7295)

#### [v3.56.3](https://github.com/Financial-Times/polyfill-library/compare/v3.56.2...v3.56.3)

> 10 April 2020

- Update publish-to-npm.yml [`5b89d45`](https://github.com/Financial-Times/polyfill-library/commit/5b89d456046e54b50388d6d289c834b0d3248351)

#### [v3.56.2](https://github.com/Financial-Times/polyfill-library/compare/v3.56.1...v3.56.2)

> 9 April 2020

- use a token which is not the default token so that other actions can be triggered based on this action [`1c729e2`](https://github.com/Financial-Times/polyfill-library/commit/1c729e25302d80422369abe91753d088f472065f)
- Move from CircleCI to GitHub Actions [`48edb91`](https://github.com/Financial-Times/polyfill-library/commit/48edb9188f8a6cba8a047fed16dc6afa5971e348)

#### [v3.56.1](https://github.com/Financial-Times/polyfill-library/compare/v3.56.0...v3.56.1)

> 8 April 2020

- use correct variable name [`1639518`](https://github.com/Financial-Times/polyfill-library/commit/16395188e1db77f36c9c4a2624b15d0e74945178)

#### [v3.56.0](https://github.com/Financial-Times/polyfill-library/compare/v3.55.0...v3.56.0)

> 8 April 2020

- Refactor: inline the polyfill resolver into a non-recursive for loop [`8dddec1`](https://github.com/Financial-Times/polyfill-library/commit/8dddec116c2b59999269c18f93551d2d1dca1942)
- Move from CircleCI to GitHub Actions [`faebc94`](https://github.com/Financial-Times/polyfill-library/commit/faebc942478ae9c1d818fdbfca74c38267a5fbe1)
- update browserstack browser list [`d958bd7`](https://github.com/Financial-Times/polyfill-library/commit/d958bd75b62d459bb630748c875126aaa56dc63a)

#### [v3.55.0](https://github.com/Financial-Times/polyfill-library/compare/v3.54.1...v3.55.0)

> 6 April 2020

- Add URLSearchParams sort method [`d71acd7`](https://github.com/Financial-Times/polyfill-library/commit/d71acd7287f3ece7976052866b79a66001ba9691)

#### [v3.54.1](https://github.com/Financial-Times/polyfill-library/compare/v3.54.0...v3.54.1)

> 6 April 2020

- Ensure callback for HTMLCanvasElement.prototype.toBlob is not invoked syncronously [`#208`](https://github.com/Financial-Times/polyfill-library/issues/208)

#### [v3.54.0](https://github.com/Financial-Times/polyfill-library/compare/v3.53.2...v3.54.0)

> 6 April 2020

- Make AddEntriesFromIterable work in ie8 [`842ba1d`](https://github.com/Financial-Times/polyfill-library/commit/842ba1dcc5d961a147f805f5c147bdb28be3475e)
- move tests which don't require Symbol outside of the symbol if block [`50dc255`](https://github.com/Financial-Times/polyfill-library/commit/50dc25566fcaeba48d6787b342e7c8d9ac827e1b)
- dont serve symbol.iterator or symbol to firefox 36 or above [`58bcaac`](https://github.com/Financial-Times/polyfill-library/commit/58bcaac6dab8df9b1daf08434d8f87f814af5747)

#### [v3.53.2](https://github.com/Financial-Times/polyfill-library/compare/v3.53.1...v3.53.2)

> 4 April 2020

-  Allow falsey keys to be used in Map.prototype.set  [`#536`](https://github.com/Financial-Times/polyfill-library/issues/536)
- make project pass the unicorn/recommended eslint config [`65a860c`](https://github.com/Financial-Times/polyfill-library/commit/65a860cb2246f182acad92abb47aefdcbaafae54)

#### [v3.53.1](https://github.com/Financial-Times/polyfill-library/compare/v3.53.0...v3.53.1)

> 19 March 2020

- serve element.prototype.matches to edge versions below 18 [`#541`](https://github.com/Financial-Times/polyfill-library/issues/541)
- use git tag as version [`ec00a9d`](https://github.com/Financial-Times/polyfill-library/commit/ec00a9ddf3491dc0550727c693bf54b7537beee1)

#### [v3.53.0](https://github.com/Financial-Times/polyfill-library/compare/v3.52.3...v3.53.0)

> 19 March 2020

- abortcontroller : update config.toml [`#539`](https://github.com/Financial-Times/polyfill-library/pull/539)
- Add origami-version GitHub Action [`1bd944b`](https://github.com/Financial-Times/polyfill-library/commit/1bd944b8a5cbe7f339a1cd1865520727f35e2291)
- update to latest useragent parser [`258b071`](https://github.com/Financial-Times/polyfill-library/commit/258b0717482bf0d5708ac3cb24d9a8817b021c56)
- Add the origami-labels GitHub Action [ci skip] [`32cbd60`](https://github.com/Financial-Times/polyfill-library/commit/32cbd60c666609ca35ced3da9898139d94056b68)

#### [v3.52.3](https://github.com/Financial-Times/polyfill-library/compare/v3.52.2...v3.52.3)

> 6 March 2020

- update targets for polyfills/console/markTimeline/config.toml [`#526`](https://github.com/Financial-Times/polyfill-library/pull/526)
- update targets for polyfills/console/timelineEnd/config.toml [`#528`](https://github.com/Financial-Times/polyfill-library/pull/528)
- update targets for polyfills/console/timeline/config.toml [`#527`](https://github.com/Financial-Times/polyfill-library/pull/527)
- update targets for polyfills/Object/assign/config.toml [`#529`](https://github.com/Financial-Times/polyfill-library/pull/529)
- Ship Math.hypot to chrome 77 as it's implementation does not return NaN for `Math.hypot(undefined,0)` [`#531`](https://github.com/Financial-Times/polyfill-library/pull/531)
- update targets for polyfills/console/exception/config.toml [`#525`](https://github.com/Financial-Times/polyfill-library/pull/525)
- Check and update polyfill targeting once a day automatically [`#530`](https://github.com/Financial-Times/polyfill-library/pull/530)
- If navigator.sendBeacon can not queue the work for transferring, return false as per the specification. [`#524`](https://github.com/Financial-Times/polyfill-library/pull/524)
- Make the focusin detect work when document.body does not yet exist [`#522`](https://github.com/Financial-Times/polyfill-library/pull/522)
- If navigator.sendBeacon can not queue the work for transferring, return false as per the specification. (#524) [`#2160`](https://github.com/Financial-Times/polyfill-service/issues/2160)
- use correct key for aliases [`e7322ea`](https://github.com/Financial-Times/polyfill-library/commit/e7322ea297c2e6cba7b5958cb09662a94b132d92)
- dont exit early if the commands exit with a non-zero code [`cc4d3e5`](https://github.com/Financial-Times/polyfill-library/commit/cc4d3e5a1a364400aed78f3bb8d267c60857c0a8)
- install hub direct from github [`8a6c5ab`](https://github.com/Financial-Times/polyfill-library/commit/8a6c5ab631f8d99a9562deebd0814da827782cf0)

#### [v3.52.2](https://github.com/Financial-Times/polyfill-library/compare/v3.52.1...v3.52.2)

> 29 February 2020

- fix detect for getOwnPropertyNames [`e548271`](https://github.com/Financial-Times/polyfill-library/commit/e54827166e59b0c851e3c9c60c41a1b3fb1b000c)

#### [v3.52.1](https://github.com/Financial-Times/polyfill-library/compare/v3.52.0...v3.52.1)

> 29 February 2020

- intl update script : fix detect [`#519`](https://github.com/Financial-Times/polyfill-library/pull/519)

#### [v3.52.0](https://github.com/Financial-Times/polyfill-library/compare/v3.51.0...v3.52.0)

> 28 February 2020

- Add a real feature detect for smoothscroll support [`#515`](https://github.com/Financial-Times/polyfill-library/pull/515)
- Make the localStorage polyfill and feature detect work on opaque origins [`#514`](https://github.com/Financial-Times/polyfill-library/pull/514)
- ensure the audio polyfill only runs in browsers which have webkitAudioContext because it depends on this to exist [`#513`](https://github.com/Financial-Times/polyfill-library/pull/513)

#### [v3.51.0](https://github.com/Financial-Times/polyfill-library/compare/v3.50.2...v3.51.0)

> 27 February 2020

- make the Intl detect smaller [`86f1459`](https://github.com/Financial-Times/polyfill-library/commit/86f14599eed356e2d38bf3f7e1810264b393470d)
- change from template literal to string literal to pass lnt rules [`06d18b9`](https://github.com/Financial-Times/polyfill-library/commit/06d18b975156bea6dcb0010c9edba5a35ebec1c2)
- swap from template literal to string [`cb2b61e`](https://github.com/Financial-Times/polyfill-library/commit/cb2b61e16c83a8184c97baa46adde2b2618c2044)

#### [v3.50.2](https://github.com/Financial-Times/polyfill-library/compare/v3.50.0...v3.50.2)

> 27 February 2020

#### [v3.50.0](https://github.com/Financial-Times/polyfill-library/compare/v3.49.0...v3.50.0)

> 27 February 2020

- if supportedLocalesOf throws an error, it is because the locale name does not exist, we need to return false in that instance [`8a2d41a`](https://github.com/Financial-Times/polyfill-library/commit/8a2d41a2686501d9ec88e7799cf51e784db66c0f)
- add the root locale for RelativeTimeFormat [`32b6168`](https://github.com/Financial-Times/polyfill-library/commit/32b6168aa81240cc70c21a94dab33fad12841fac)

#### [v3.49.0](https://github.com/Financial-Times/polyfill-library/compare/v3.48.0...v3.49.0)

> 27 February 2020

- Do not add root locale to the feature detect [`d6437c3`](https://github.com/Financial-Times/polyfill-library/commit/d6437c36cc5c8d1212f40815afacf717157fdf90)

#### [v3.48.0](https://github.com/Financial-Times/polyfill-library/compare/v3.47.0...v3.48.0)

> 27 February 2020

#### [v3.47.0](https://github.com/Financial-Times/polyfill-library/compare/v3.46.0...v3.47.0)

> 26 February 2020

- Bump @webcomponents/template from 1.4.0 to 1.4.1 [`#503`](https://github.com/Financial-Times/polyfill-library/pull/503)
- Bump mutationobserver-shim from 0.3.2 to 0.3.3 [`#502`](https://github.com/Financial-Times/polyfill-library/pull/502)
- Bump Base64 from 1.0.1 to 1.1.0 [`#504`](https://github.com/Financial-Times/polyfill-library/pull/504)
- Bump array.prototype.flatmap from 1.2.1 to 1.2.3 [`#497`](https://github.com/Financial-Times/polyfill-library/pull/497)
- Bump graceful-fs from 4.1.15 to 4.2.3 [`#494`](https://github.com/Financial-Times/polyfill-library/pull/494)
- Bump json3 from 3.3.2 to 3.3.3 [`#493`](https://github.com/Financial-Times/polyfill-library/pull/493)
- Bump stream-to-string from 1.1.0 to 1.2.0 [`#491`](https://github.com/Financial-Times/polyfill-library/pull/491)
- Fix anchor links in contributing document [`#505`](https://github.com/Financial-Times/polyfill-library/pull/505)
- Bump merge2 from 1.2.3 to 1.3.0 [`#490`](https://github.com/Financial-Times/polyfill-library/pull/490)
- Bump @financial-times/polyfill-useragent-normaliser from 1.4.2 to 1.6.3 [`#488`](https://github.com/Financial-Times/polyfill-library/pull/488)
- target browsers which do not have es6 version of Object.getOwnPropertyNames [`#487`](https://github.com/Financial-Times/polyfill-library/pull/487)
- Add documentation explaining how to add a polyfill [`#501`](https://github.com/Financial-Times/polyfill-library/pull/501)
- Add spec links to [next|previous]ElementSibling [`#500`](https://github.com/Financial-Times/polyfill-library/pull/500)
- intl : fix update task [`#499`](https://github.com/Financial-Times/polyfill-library/pull/499)
- Bump karma from 4.2.0 to 4.4.1 [`#496`](https://github.com/Financial-Times/polyfill-library/pull/496)
- [Security] Bump https-proxy-agent from 2.2.1 to 2.2.4 [`#489`](https://github.com/Financial-Times/polyfill-library/pull/489)
- update the browser targeting for RegExp.prototype.flags [`#482`](https://github.com/Financial-Times/polyfill-library/pull/482)
- Add nextElementSibling and previousElementSibling polyfills [`#484`](https://github.com/Financial-Times/polyfill-library/pull/484)
- Add es2019 alias for all the new features which were added to the spec in that version [`#483`](https://github.com/Financial-Times/polyfill-library/pull/483)
- Do not polyfill Element if it does exist -- fixes https://github.com/Financial-Times/polyfill-library/issues/458 [`#481`](https://github.com/Financial-Times/polyfill-library/pull/481)
- use a document.currentScript polyfill which works in all Internet Explorer versions :-D [`#480`](https://github.com/Financial-Times/polyfill-library/pull/480)
- update the browser targeting for RegExp.prototype.flags (#482) [`#320`](https://github.com/Financial-Times/polyfill-library/issues/320)
- Do not polyfill Element if it does exist -- fixes https://github.com/Financial-Times/polyfill-library/issues/458 (#481) [`#458`](https://github.com/Financial-Times/polyfill-library/issues/458)

#### [v3.46.0](https://github.com/Financial-Times/polyfill-library/compare/v3.45.0...v3.46.0)

> 24 February 2020

- Adds support for Intl.RelativeTimeFormat and Intl.PluralRules [`#301`](https://github.com/Financial-Times/polyfill-library/pull/301)

#### [v3.45.0](https://github.com/Financial-Times/polyfill-library/compare/v3.44.0...v3.45.0)

> 24 February 2020

- Use `self` rather than `window` in symbol polyfill [`#478`](https://github.com/Financial-Times/polyfill-library/pull/478)

#### [v3.44.0](https://github.com/Financial-Times/polyfill-library/compare/v3.43.0...v3.44.0)

> 21 February 2020

- Add TrimString abstract method and String.prototype.{trim|trimStart|trimEnd} polyfills [`#95`](https://github.com/Financial-Times/polyfill-library/pull/95)
- Improve polyfill and tests for Object.assign [`#85`](https://github.com/Financial-Times/polyfill-library/pull/85)

#### [v3.43.0](https://github.com/Financial-Times/polyfill-library/compare/v3.42.0...v3.43.0)

> 21 February 2020

- Add queueMicrotask polyfill [`#461`](https://github.com/Financial-Times/polyfill-library/pull/461)
- Bump sinon from 8.1.1 to 9.0.0 [`#473`](https://github.com/Financial-Times/polyfill-library/pull/473)
- Bump karma-browserstack-launcher from 1.4.0 to 1.5.1 [`#469`](https://github.com/Financial-Times/polyfill-library/pull/469)
- Bump web-animations-js from 2.3.1 to 2.3.2 [`#468`](https://github.com/Financial-Times/polyfill-library/pull/468)
- Improve polyfill and tests for Number.parseInt [`#81`](https://github.com/Financial-Times/polyfill-library/pull/81)
- Improve polyfill and tests for Number.parseFloat [`#80`](https://github.com/Financial-Times/polyfill-library/pull/80)
- Improve polyfill and tests for Object.create [`#79`](https://github.com/Financial-Times/polyfill-library/pull/79)
- Bump yaml from 1.1.0 to 1.7.2 [`#467`](https://github.com/Financial-Times/polyfill-library/pull/467)
- Bump glob from 7.1.3 to 7.1.6 [`#466`](https://github.com/Financial-Times/polyfill-library/pull/466)
- Serve IntersectionObserver to Opera Mobile &lt; 46 [`#470`](https://github.com/Financial-Times/polyfill-library/pull/470)
- switch the global object from being `this` to being an argument named `self` [`#318`](https://github.com/Financial-Times/polyfill-library/pull/318)
- Bump webdriverio from 5.18.6 to 5.18.7 [`#465`](https://github.com/Financial-Times/polyfill-library/pull/465)
- Bump rimraf from 3.0.1 to 3.0.2 [`#460`](https://github.com/Financial-Times/polyfill-library/pull/460)
- Bump handlebars from 4.7.2 to 4.7.3 [`#459`](https://github.com/Financial-Times/polyfill-library/pull/459)
- Add an origami.json [`#463`](https://github.com/Financial-Times/polyfill-library/pull/463)
- Use `self` instead of `this` for `Symbol` [`#298`](https://github.com/Financial-Times/polyfill-library/pull/298)
- Add workflow for adding new issues and PRs to the project board [`#452`](https://github.com/Financial-Times/polyfill-library/pull/452)
- Element.prototype.classList - native DOMTokenList is not a constructor [`#269`](https://github.com/Financial-Times/polyfill-library/pull/269)
- IntersectionObserver, polyfill iOS Safari &lt; 12.2 [`#296`](https://github.com/Financial-Times/polyfill-library/pull/296)
- Update Array.prototype.flat & Array.prototype.flatMap browser targeting [`#289`](https://github.com/Financial-Times/polyfill-library/pull/289)
- Add AbortController [`#59`](https://github.com/Financial-Times/polyfill-library/pull/59)
- feat: add string.prototype.big [`#272`](https://github.com/Financial-Times/polyfill-library/pull/272)
- feat: add string.prototype.anchor polyfill [`#271`](https://github.com/Financial-Times/polyfill-library/pull/271)
- feat: add symbol.asyncIterator polyfill [`#270`](https://github.com/Financial-Times/polyfill-library/pull/270)
- ({}).toString.call(null) should not be [object Window] [`#193`](https://github.com/Financial-Times/polyfill-library/pull/193)
- Add Reflect.defineProperty polyfill [`#240`](https://github.com/Financial-Times/polyfill-library/pull/240)
- 3.34.0 [`#194`](https://github.com/Financial-Times/polyfill-library/pull/194)
- Add requestIdleCallback and cancelIdleCallback. [`#192`](https://github.com/Financial-Times/polyfill-library/pull/192)
- Replace fs with graceful-fs to stop too many files open error [`#145`](https://github.com/Financial-Times/polyfill-library/pull/145)
- Add opera mob to CreateMethodProperty [`#78`](https://github.com/Financial-Times/polyfill-library/pull/78)
- Map polyfill: missing opera config [`#8`](https://github.com/Financial-Times/polyfill-library/pull/8)
- Set polyfill: missing opera config  [`#9`](https://github.com/Financial-Times/polyfill-library/pull/9)
- Small refactoring of UA class [`#16`](https://github.com/Financial-Times/polyfill-library/pull/16)
- Sort the features by name before topographically sorting them  [`#11`](https://github.com/Financial-Times/polyfill-library/pull/11)
- Simplify the codebase [`#13`](https://github.com/Financial-Times/polyfill-library/pull/13)
- Move Function.prototype.name polyfill to correct folder location [`#1`](https://github.com/Financial-Times/polyfill-library/pull/1)
- getPolyfillString without check for unsupported ua [`#6`](https://github.com/Financial-Times/polyfill-library/pull/6)
- add callback option [`#12`](https://github.com/Financial-Times/polyfill-library/pull/12)
- Add dotenv dev dependency [`#10`](https://github.com/Financial-Times/polyfill-library/pull/10)
- Generate circleci config where each polyfill test is a separate job [`#3`](https://github.com/Financial-Times/polyfill-library/pull/3)
- Add CircleCI config [`#2`](https://github.com/Financial-Times/polyfill-library/pull/2)
- Move from custom test-runner to Karma [`#1826`](https://github.com/Financial-Times/polyfill-library/pull/1826)
- Use new version of proclaim which has all the custom methods we had implemented [`#1824`](https://github.com/Financial-Times/polyfill-library/pull/1824)
- Versioned libraries [`#1820`](https://github.com/Financial-Times/polyfill-library/pull/1820)
- Release 3.27.0 [`#1814`](https://github.com/Financial-Times/polyfill-library/pull/1814)
- Release 3.27.0 [`#1814`](https://github.com/Financial-Times/polyfill-library/pull/1814)
- Add tests for Math.log10 [`#1803`](https://github.com/Financial-Times/polyfill-library/pull/1803)
- Add more test for Number.EPSILON [`#1804`](https://github.com/Financial-Times/polyfill-library/pull/1804)
- remove handlebars from polyfill-library [`#1800`](https://github.com/Financial-Times/polyfill-library/pull/1800)
- Simplify the service by moving from serverless back to heroku [`#1798`](https://github.com/Financial-Times/polyfill-library/pull/1798)
- Fix formatting in polyfill-library readme [`#1786`](https://github.com/Financial-Times/polyfill-library/pull/1786)
- [fix] Add Samsung Browser to Promise.prototype.finally polyfill config [`#1763`](https://github.com/Financial-Times/polyfill-library/pull/1763)
- Add missing Event constants [`#1729`](https://github.com/Financial-Times/polyfill-library/pull/1729)
- Fixed console specs link [`#1746`](https://github.com/Financial-Times/polyfill-library/pull/1746)
- Only apply URL polyfill for Safari &lt; 12 [`#1766`](https://github.com/Financial-Times/polyfill-library/pull/1766)
- Add es2018 alias [`#1779`](https://github.com/Financial-Times/polyfill-library/pull/1779)
- Array.prototype.values updated browser support [`#1776`](https://github.com/Financial-Times/polyfill-library/pull/1776)
- Beta V3 API -- Moving from Heroku to AWS+Serverless framework  [`#1777`](https://github.com/Financial-Times/polyfill-library/pull/1777)
- Add headlesschrome to aliases [`#1726`](https://github.com/Financial-Times/polyfill-library/pull/1726)
- add polyfill for NodeList.forEach [`#1710`](https://github.com/Financial-Times/polyfill-library/pull/1710)
- Rewrite Math.fround to be spec compliant and use es abstract methods [`#1578`](https://github.com/Financial-Times/polyfill-library/pull/1578)
- Link to the correct section in the spec for Number.isNaN [`#1708`](https://github.com/Financial-Times/polyfill-library/pull/1708)
- Fix all linting warnings and errors in polyfill-library module [`#1707`](https://github.com/Financial-Times/polyfill-library/pull/1707)
- Enable custom polyfill collection to be used with the polyfill-library module [`#1706`](https://github.com/Financial-Times/polyfill-library/pull/1706)
- improve test coverage for Array.prototype.keys [`#1631`](https://github.com/Financial-Times/polyfill-library/pull/1631)
- Server Number.isInteger polyfill to Chrome 19-33 [`#1703`](https://github.com/Financial-Times/polyfill-library/pull/1703)
- Serve HTMLCanvasElement.prototype.toBlob to Edge and don't serve to Safari 11 [`#1704`](https://github.com/Financial-Times/polyfill-library/pull/1704)
- update Yaku version to support Promise polyfilling in Web Worker [`#1701`](https://github.com/Financial-Times/polyfill-library/pull/1701)
- Don't add the outer closure if no polyfills need to be served [`#1695`](https://github.com/Financial-Times/polyfill-library/pull/1695)
- improve tests for setimmediate [`#1665`](https://github.com/Financial-Times/polyfill-library/pull/1665)
- Split into polyfill-library and polyfill-service [`#1693`](https://github.com/Financial-Times/polyfill-library/pull/1693)
- Use `self` instead of `this` for `Symbol` (#298) [`#297`](https://github.com/Financial-Times/polyfill-library/issues/297)
- Serve Array.prototype.fill to all ie mobile [`#344`](https://github.com/Financial-Times/polyfill-library/issues/344)
- Serve URL/URLSearchParams polyfill to Firefox versions below 44 [`#311`](https://github.com/Financial-Times/polyfill-library/issues/311)
- Removing the typeof check with early return because it is handled via the `new Event` check, which is more thorough and will correctly detect bad Event constructors in Android 4.x [`#19`](https://github.com/Financial-Times/polyfill-library/issues/19)
- Update config.json [`#173`](https://github.com/Financial-Times/polyfill-library/issues/173)
- Update support of requestAnimationFrame for Opera Mini [`#172`](https://github.com/Financial-Times/polyfill-library/issues/172)
- Use Graceful-fs when updating/building third-party polyfills [`#128`](https://github.com/Financial-Times/polyfill-library/issues/128)
- Make Element.prototype.dataset properties enumerable [`#37`](https://github.com/Financial-Times/polyfill-library/issues/37)
- Add es6 alias for String.fromCodePoint. Fixes #1875 [`#1875`](https://github.com/Financial-Times/polyfill-library/issues/1875)
- remove handlebars from polyfill-library (#1800) [`#1792`](https://github.com/Financial-Times/polyfill-service/pull/1792)
- add polyfill for NodeList.forEach (#1710) [`#1686`](https://github.com/Financial-Times/polyfill-library/issues/1686) [`#1430`](https://github.com/Financial-Times/polyfill-library/issues/1430)
- Don't add the outer closure if no polyfills need to be served (#1695) [`#1685`](https://github.com/Financial-Times/polyfill-library/issues/1685)
- Convert every JSON file to TOML [`a6dba64`](https://github.com/Financial-Times/polyfill-library/commit/a6dba64c8c658caa4aec48cdd7af85a71f5fadb5)
- move from yarn to npm and use npm ci [`af2f86f`](https://github.com/Financial-Times/polyfill-library/commit/af2f86f8fcd9251fa748823d04dd46362cc41ed2)
- Add all the missing browsers in the internal polyfills [`efab9f1`](https://github.com/Financial-Times/polyfill-library/commit/efab9f1ea7a57832595c4025b35328179776d33e)

#### [v3.42.0](https://github.com/Financial-Times/polyfill-library/compare/v3.41.0...v3.42.0)

> 8 November 2019

- Serve URL/URLSearchParams polyfill to Firefox versions below 44 [`#311`](https://github.com/Financial-Times/polyfill-library/issues/311)
- update circleci config with tests for smoothscroll [`d7ccbab`](https://github.com/Financial-Times/polyfill-library/commit/d7ccbab1020e79499b5bbcaeae31b255ab97c5c6)
- [NR] adding patch to polyfill to remove UMD code [`cb437cc`](https://github.com/Financial-Times/polyfill-library/commit/cb437cc994715ba290cafa26579fec5e0e0cb09d)
- Adding smoothscroll polyfill for element.scroll* methods [`37323ce`](https://github.com/Financial-Times/polyfill-library/commit/37323cebc9d121d4744363db255738b2dbb5bbf8)

#### [v3.41.0](https://github.com/Financial-Times/polyfill-library/compare/v3.40.0...v3.41.0)

> 25 September 2019

- Update and rename detect-disabled.js to detect.js [`65767d1`](https://github.com/Financial-Times/polyfill-library/commit/65767d1db6cc684df6da988decd4bdb36cab7e8b)
- Update detect-disabled.js [`443e56a`](https://github.com/Financial-Times/polyfill-library/commit/443e56a38d0dc638030929c4cef86f1171e1b694)

#### [v3.40.0](https://github.com/Financial-Times/polyfill-library/compare/v3.39.0...v3.40.0)

> 9 September 2019

- Serve IntersectionObserver polyfill to Safari 12.1 [`89cfbc7`](https://github.com/Financial-Times/polyfill-library/commit/89cfbc71b668de0774dc4104bb58efd3f0343e94)

#### [v3.39.0](https://github.com/Financial-Times/polyfill-library/compare/v3.38.0...v3.39.0)

> 4 September 2019

- Element.prototype.classList - native DOMTokenList is not a constructor [`#269`](https://github.com/Financial-Times/polyfill-library/pull/269)
- IntersectionObserver, polyfill iOS Safari &lt; 12.2 [`#296`](https://github.com/Financial-Times/polyfill-library/pull/296)

#### [v3.38.0](https://github.com/Financial-Times/polyfill-library/compare/v3.37.0...v3.38.0)

> 31 July 2019

- Update Array.prototype.flat & Array.prototype.flatMap browser targeting [`#289`](https://github.com/Financial-Times/polyfill-library/pull/289)
- Add AbortController [`#59`](https://github.com/Financial-Times/polyfill-library/pull/59)
- feat: add string.prototype.big [`#272`](https://github.com/Financial-Times/polyfill-library/pull/272)
- feat: add string.prototype.anchor polyfill [`#271`](https://github.com/Financial-Times/polyfill-library/pull/271)
- feat: add symbol.asyncIterator polyfill [`#270`](https://github.com/Financial-Times/polyfill-library/pull/270)
- ({}).toString.call(null) should not be [object Window] [`#193`](https://github.com/Financial-Times/polyfill-library/pull/193)
- feat: add string.prototype.fontsize [`2e4e9fa`](https://github.com/Financial-Times/polyfill-library/commit/2e4e9fa8fe580b6432efdc030ac2e8bc6650e409)
- feat: add string.prototype.blink [`7912033`](https://github.com/Financial-Times/polyfill-library/commit/7912033121488d586ea0019e52e56a7ff07debc8)
- feat: add string.prototype.bold [`fe231bb`](https://github.com/Financial-Times/polyfill-library/commit/fe231bbae9dae0694a754d5858413b0cc483a780)

#### [v3.37.0](https://github.com/Financial-Times/polyfill-library/compare/v3.36.0...v3.37.0)

> 23 July 2019

- Add Object.getOwnPropertyDescriptors to the es2017 alias [`0ec5191`](https://github.com/Financial-Times/polyfill-library/commit/0ec5191c3ea52bb9ca21d8ba9b4daf6b218ee4f1)

#### [v3.36.0](https://github.com/Financial-Times/polyfill-library/compare/v3.35.0...v3.36.0)

> 19 July 2019

- Convert every JSON file to TOML [`c38ac31`](https://github.com/Financial-Times/polyfill-library/commit/c38ac31fde0cdf470ede3baa0212878f98dd52fb)
- update nyc [`7253387`](https://github.com/Financial-Times/polyfill-library/commit/72533870ac2e3d5e8073b7f16a00292b9429a327)
- Add snyk [`3bfbf41`](https://github.com/Financial-Times/polyfill-library/commit/3bfbf41f93def81fed29342d2c1016a29c3374f8)

#### [v3.35.0](https://github.com/Financial-Times/polyfill-library/compare/v3.34.0...v3.35.0)

> 5 July 2019

- Add Reflect.defineProperty polyfill [`#240`](https://github.com/Financial-Times/polyfill-library/pull/240)
- update browserlist for browserstack [`0087c7d`](https://github.com/Financial-Times/polyfill-library/commit/0087c7dca36b76f2db3cbe80d4de47a910ffe5b2)
- add HTMLTemplateElement as an available polyfill [`845eef7`](https://github.com/Financial-Times/polyfill-library/commit/845eef78e955abdfb44b1453057d1ce95a1b6336)
- update expected results for test now that typed-arrays are being bundled correctly [`bdad622`](https://github.com/Financial-Times/polyfill-library/commit/bdad622366edcc04f7dba93bd4b740d6f75f17e2)

#### [v3.34.0](https://github.com/Financial-Times/polyfill-library/compare/v3.33.0...v3.34.0)

> 29 April 2019

- 3.34.0 [`#194`](https://github.com/Financial-Times/polyfill-library/pull/194)
- Add requestIdleCallback and cancelIdleCallback. [`#192`](https://github.com/Financial-Times/polyfill-library/pull/192)
- Removing the typeof check with early return because it is handled via the `new Event` check, which is more thorough and will correctly detect bad Event constructors in Android 4.x [`#19`](https://github.com/Financial-Times/polyfill-library/issues/19)
- Add core requestIdleCallback functionality. [`f6fb561`](https://github.com/Financial-Times/polyfill-library/commit/f6fb5616fe35858a4be9e8d6b748f059c4231a6a)
- WIP: Add toggle attribute polyfill. [`bdfe551`](https://github.com/Financial-Times/polyfill-library/commit/bdfe551772b316768e4cbe2058aadc3c5312d7fb)
- Wrap in a describe block [`b1fce20`](https://github.com/Financial-Times/polyfill-library/commit/b1fce20a9c6779b0f2c2e3131a38dbc5d7c954b7)

#### [v3.33.0](https://github.com/Financial-Times/polyfill-library/compare/v3.32.0...v3.33.0)

> 3 April 2019

- preserve function names in minified code [`100ee97`](https://github.com/Financial-Times/polyfill-library/commit/100ee974784a9f5e4b0aa371cb928d8f331d96da)
- Update polyfill.js [`ad3b29f`](https://github.com/Financial-Times/polyfill-library/commit/ad3b29f4361ee5af72733494555fe19bbda3533e)

#### [v3.32.0](https://github.com/Financial-Times/polyfill-library/compare/v3.31.1...v3.32.0)

> 3 April 2019

- Update config.json [`#173`](https://github.com/Financial-Times/polyfill-library/issues/173)
- Update support of requestAnimationFrame for Opera Mini [`#172`](https://github.com/Financial-Times/polyfill-library/issues/172)
- Serve Promise to op_mob [`49f9330`](https://github.com/Financial-Times/polyfill-library/commit/49f93306ae4b69cfe0f7f085947d3537ac9f6eae)
- Make polyfill work in IE8 and Chrome 43 [`6025f49`](https://github.com/Financial-Times/polyfill-library/commit/6025f49450d08b4f5f929decfdbb95ef6b2c6156)
- Updates browser support for Symbol.match and Symbol.replace [`9c90a52`](https://github.com/Financial-Times/polyfill-library/commit/9c90a52f40f90077c8ae078c506cca62ad52f7e8)

#### [v3.31.1](https://github.com/Financial-Times/polyfill-library/compare/v3.31.0...v3.31.1)

> 4 March 2019

- Use IIFEs to store state for listPolyfills and listAliases as they never are functions which always return the exact same result [`8237458`](https://github.com/Financial-Times/polyfill-library/commit/823745861af1d7988e1f7fd1dd37c874c215e4b5)
- use an LRU cache for the getPolyfillMeta function to avoid too many filesystem operations [`4c37562`](https://github.com/Financial-Times/polyfill-library/commit/4c37562ce3a6bd795ce17748c6c1ca492186829e)

#### [v3.31.0](https://github.com/Financial-Times/polyfill-library/compare/v3.30.1...v3.31.0)

> 27 February 2019

#### [v3.30.1](https://github.com/Financial-Times/polyfill-library/compare/v3.30.0...v3.30.1)

> 22 February 2019

- builds polyfills/__dist folder before publishing the package instead of when installing the package [`5d9747e`](https://github.com/Financial-Times/polyfill-library/commit/5d9747ec32c919cd36716634a6659d5c334ae1ed)

#### [v3.30.0](https://github.com/Financial-Times/polyfill-library/compare/v3.29.0...v3.30.0)

> 22 February 2019

- Replace fs with graceful-fs to stop too many files open error [`#145`](https://github.com/Financial-Times/polyfill-library/pull/145)
- Minify detect.js output [`cf1d139`](https://github.com/Financial-Times/polyfill-library/commit/cf1d139c8fdb5d562fa44f199dd004eec656a22e)
- Make two separate minify functions for polyfills and detects [`9109e2a`](https://github.com/Financial-Times/polyfill-library/commit/9109e2ab4f534dec85be92f409d016c3b410ecc9)

#### [v3.29.0](https://github.com/Financial-Times/polyfill-library/compare/v3.28.1...v3.29.0)

> 22 February 2019

- add back nyc [`7a5d036`](https://github.com/Financial-Times/polyfill-library/commit/7a5d036b37da16933039b0204e02efc3db52a355)
- Remove babel as no polyfills require it [`15a0fdb`](https://github.com/Financial-Times/polyfill-library/commit/15a0fdb331141d23d6f8dd63ceaf27bdc43d8993)
- Add array.prototype.flat polyfill [`a008ddf`](https://github.com/Financial-Times/polyfill-library/commit/a008ddf2efe2c8d35e6e7e1e8ac436c10c52810f)

#### [v3.28.1](https://github.com/Financial-Times/polyfill-library/compare/v3.28.0...v3.28.1)

> 19 February 2019

- Add test to show objects with null prototypes work as key [`c14fe63`](https://github.com/Financial-Times/polyfill-library/commit/c14fe6351255aeecbfdb74c16738ae37df8c5cd6)
- Fixes check for -0 in Map.set polyfill [`18dfee3`](https://github.com/Financial-Times/polyfill-library/commit/18dfee3cb03fb543f5ab8263213b83c1363ab80c)

#### [v3.28.0](https://github.com/Financial-Times/polyfill-library/compare/v3.27.4...v3.28.0)

> 12 February 2019

- Add opera mob to CreateMethodProperty [`#78`](https://github.com/Financial-Times/polyfill-library/pull/78)
- Use Graceful-fs when updating/building third-party polyfills [`#128`](https://github.com/Financial-Times/polyfill-library/issues/128)
- Make Element.prototype.dataset properties enumerable [`#37`](https://github.com/Financial-Times/polyfill-library/issues/37)
- Add es6 alias for String.fromCodePoint. Fixes #1875 [`#1875`](https://github.com/Financial-Times/polyfill-library/issues/1875)
- move from yarn to npm and use npm ci [`1e4f2b7`](https://github.com/Financial-Times/polyfill-library/commit/1e4f2b7b1514deb8539c74f4446ca7f3e4f40976)
- Add command timeout of an hour for testing on browsers [`9016737`](https://github.com/Financial-Times/polyfill-library/commit/901673738f8665d346444a931dfd945374e0a430)
- Add Array.prototype.flatMap polyfill and FlattenIntoArray helper [`1e382e2`](https://github.com/Financial-Times/polyfill-library/commit/1e382e260ef17faf1c894ee520918431797d0320)

#### [v3.27.4](https://github.com/Financial-Times/polyfill-library/compare/v3.27.3...v3.27.4)

> 24 January 2019

- Add listAliases function [`1f7f11d`](https://github.com/Financial-Times/polyfill-library/commit/1f7f11d3fb95c95cefcbcb40947799053597b3fd)

#### [v3.27.3](https://github.com/Financial-Times/polyfill-library/compare/v3.27.2...v3.27.3)

> 24 January 2019

- Map polyfill: missing opera config [`#8`](https://github.com/Financial-Times/polyfill-library/pull/8)
- Set polyfill: missing opera config  [`#9`](https://github.com/Financial-Times/polyfill-library/pull/9)

#### [v3.27.2](https://github.com/Financial-Times/polyfill-library/compare/v3.27.1...v3.27.2)

> 24 January 2019

- Small refactoring of UA class [`#16`](https://github.com/Financial-Times/polyfill-library/pull/16)
- Sort the features by name before topographically sorting them  [`#11`](https://github.com/Financial-Times/polyfill-library/pull/11)
- Simplify the codebase [`#13`](https://github.com/Financial-Times/polyfill-library/pull/13)
- Move Function.prototype.name polyfill to correct folder location [`#1`](https://github.com/Financial-Times/polyfill-library/pull/1)
- getPolyfillString without check for unsupported ua [`#6`](https://github.com/Financial-Times/polyfill-library/pull/6)
- Use contributing guide url for contributing guide links [`6b703cb`](https://github.com/Financial-Times/polyfill-library/commit/6b703cb6ece0bdca5a71d6aa0107c8a7a1ebaad3)
- No classes [`b379e79`](https://github.com/Financial-Times/polyfill-library/commit/b379e796dc3e54cdb03ca7584b32d5df963e8a93)
- Remove ability to change the polyfillsPath [`db94e4b`](https://github.com/Financial-Times/polyfill-library/commit/db94e4bd1b9b9f41bc5bc1cef1d0e0348c9d926a)

#### [v3.27.1](https://github.com/Financial-Times/polyfill-library/compare/v3.27.0...v3.27.1)

> 17 January 2019

- add callback option [`#12`](https://github.com/Financial-Times/polyfill-library/pull/12)
- Add dotenv dev dependency [`#10`](https://github.com/Financial-Times/polyfill-library/pull/10)
- Generate circleci config where each polyfill test is a separate job [`#3`](https://github.com/Financial-Times/polyfill-library/pull/3)
- Add CircleCI config [`#2`](https://github.com/Financial-Times/polyfill-library/pull/2)
- Move from custom test-runner to Karma [`#1826`](https://github.com/Financial-Times/polyfill-library/pull/1826)
- Use new version of proclaim which has all the custom methods we had implemented [`#1824`](https://github.com/Financial-Times/polyfill-library/pull/1824)
- Versioned libraries [`#1820`](https://github.com/Financial-Times/polyfill-library/pull/1820)
- Release 3.27.0 [`#1814`](https://github.com/Financial-Times/polyfill-library/pull/1814)
- Release 3.27.0 [`#1814`](https://github.com/Financial-Times/polyfill-library/pull/1814)
- Add tests for Math.log10 [`#1803`](https://github.com/Financial-Times/polyfill-library/pull/1803)
- Add more test for Number.EPSILON [`#1804`](https://github.com/Financial-Times/polyfill-library/pull/1804)
- remove handlebars from polyfill-library [`#1800`](https://github.com/Financial-Times/polyfill-library/pull/1800)
- Simplify the service by moving from serverless back to heroku [`#1798`](https://github.com/Financial-Times/polyfill-library/pull/1798)
- Fix formatting in polyfill-library readme [`#1786`](https://github.com/Financial-Times/polyfill-library/pull/1786)
- [fix] Add Samsung Browser to Promise.prototype.finally polyfill config [`#1763`](https://github.com/Financial-Times/polyfill-library/pull/1763)
- Add missing Event constants [`#1729`](https://github.com/Financial-Times/polyfill-library/pull/1729)
- Fixed console specs link [`#1746`](https://github.com/Financial-Times/polyfill-library/pull/1746)
- Only apply URL polyfill for Safari &lt; 12 [`#1766`](https://github.com/Financial-Times/polyfill-library/pull/1766)
- Add es2018 alias [`#1779`](https://github.com/Financial-Times/polyfill-library/pull/1779)
- Array.prototype.values updated browser support [`#1776`](https://github.com/Financial-Times/polyfill-library/pull/1776)
- Beta V3 API -- Moving from Heroku to AWS+Serverless framework  [`#1777`](https://github.com/Financial-Times/polyfill-library/pull/1777)
- Add headlesschrome to aliases [`#1726`](https://github.com/Financial-Times/polyfill-library/pull/1726)
- add polyfill for NodeList.forEach [`#1710`](https://github.com/Financial-Times/polyfill-library/pull/1710)
- Rewrite Math.fround to be spec compliant and use es abstract methods [`#1578`](https://github.com/Financial-Times/polyfill-library/pull/1578)
- Link to the correct section in the spec for Number.isNaN [`#1708`](https://github.com/Financial-Times/polyfill-library/pull/1708)
- Fix all linting warnings and errors in polyfill-library module [`#1707`](https://github.com/Financial-Times/polyfill-library/pull/1707)
- Enable custom polyfill collection to be used with the polyfill-library module [`#1706`](https://github.com/Financial-Times/polyfill-library/pull/1706)
- improve test coverage for Array.prototype.keys [`#1631`](https://github.com/Financial-Times/polyfill-library/pull/1631)
- Server Number.isInteger polyfill to Chrome 19-33 [`#1703`](https://github.com/Financial-Times/polyfill-library/pull/1703)
- Serve HTMLCanvasElement.prototype.toBlob to Edge and don't serve to Safari 11 [`#1704`](https://github.com/Financial-Times/polyfill-library/pull/1704)
- update Yaku version to support Promise polyfilling in Web Worker [`#1701`](https://github.com/Financial-Times/polyfill-library/pull/1701)
- Don't add the outer closure if no polyfills need to be served [`#1695`](https://github.com/Financial-Times/polyfill-library/pull/1695)
- improve tests for setimmediate [`#1665`](https://github.com/Financial-Times/polyfill-library/pull/1665)
- Split into polyfill-library and polyfill-service [`#1693`](https://github.com/Financial-Times/polyfill-library/pull/1693)
- remove handlebars from polyfill-library (#1800) [`#1792`](https://github.com/Financial-Times/polyfill-service/pull/1792)
- add polyfill for NodeList.forEach (#1710) [`#1686`](https://github.com/Financial-Times/polyfill-library/issues/1686) [`#1430`](https://github.com/Financial-Times/polyfill-library/issues/1430)
- Don't add the outer closure if no polyfills need to be served (#1695) [`#1685`](https://github.com/Financial-Times/polyfill-library/issues/1685)
- update lock [`80a2310`](https://github.com/Financial-Times/polyfill-library/commit/80a231080cb18c634039a63beff120315d63a60a)
- Update docs to be consistent with actual implementation [`ea394e7`](https://github.com/Financial-Times/polyfill-library/commit/ea394e71ee5e8b163e741938b4504d33025f9ecb)
- replace . and @ characters in job names as they are violate the circleci schema [`fbcd56b`](https://github.com/Financial-Times/polyfill-library/commit/fbcd56b6b1fe920a3b82861d0dd237e9290a43b9)

#### [v3.27.0](https://github.com/Financial-Times/polyfill-library/compare/v3.25.1...v3.27.0)

> 20 November 2018

- Release 3.27.0 [`#1814`](https://github.com/Financial-Times/polyfill-library/pull/1814)
- Release 3.27.0 [`#1814`](https://github.com/Financial-Times/polyfill-library/pull/1814)
- Add tests for Math.log10 [`#1803`](https://github.com/Financial-Times/polyfill-library/pull/1803)
- Add more test for Number.EPSILON [`#1804`](https://github.com/Financial-Times/polyfill-library/pull/1804)
- remove handlebars from polyfill-library [`#1800`](https://github.com/Financial-Times/polyfill-library/pull/1800)
- checkout [`#1799`](https://github.com/Financial-Times/polyfill-library/pull/1799)
- Simplify the service by moving from serverless back to heroku [`#1798`](https://github.com/Financial-Times/polyfill-library/pull/1798)
- A collection of little improvements to V3 docs. [`#1782`](https://github.com/Financial-Times/polyfill-library/pull/1782)
- Fix formatting in polyfill-library readme [`#1786`](https://github.com/Financial-Times/polyfill-library/pull/1786)
- [fix] Add Samsung Browser to Promise.prototype.finally polyfill config [`#1763`](https://github.com/Financial-Times/polyfill-library/pull/1763)
- Add missing Event constants [`#1729`](https://github.com/Financial-Times/polyfill-library/pull/1729)
- remove firefox 39 as it is being flaky right now [`#1781`](https://github.com/Financial-Times/polyfill-library/pull/1781)
- Fixed console specs link [`#1746`](https://github.com/Financial-Times/polyfill-library/pull/1746)
- Only apply URL polyfill for Safari &lt; 12 [`#1766`](https://github.com/Financial-Times/polyfill-library/pull/1766)
- Add es2018 alias [`#1779`](https://github.com/Financial-Times/polyfill-library/pull/1779)
- Array.prototype.values updated browser support [`#1776`](https://github.com/Financial-Times/polyfill-library/pull/1776)
- Beta V3 API -- Moving from Heroku to AWS+Serverless framework  [`#1777`](https://github.com/Financial-Times/polyfill-library/pull/1777)
- fixing links in README.md to reference the correct location [`#1747`](https://github.com/Financial-Times/polyfill-library/pull/1747)
- Add headlesschrome to aliases [`#1726`](https://github.com/Financial-Times/polyfill-library/pull/1726)
- Dev script in root packages.json now points to polyfill-service instead of polyfill-library, which does not have a dev script. [`#1723`](https://github.com/Financial-Times/polyfill-library/pull/1723)
- add polyfill for NodeList.forEach [`#1710`](https://github.com/Financial-Times/polyfill-library/pull/1710)
- Rewrite Math.fround to be spec compliant and use es abstract methods [`#1578`](https://github.com/Financial-Times/polyfill-library/pull/1578)
- Link to the correct section in the spec for Number.isNaN [`#1708`](https://github.com/Financial-Times/polyfill-library/pull/1708)
- Fix all linting warnings and errors in polyfill-library module [`#1707`](https://github.com/Financial-Times/polyfill-library/pull/1707)
- Enable custom polyfill collection to be used with the polyfill-library module [`#1706`](https://github.com/Financial-Times/polyfill-library/pull/1706)
- update docs [`#1709`](https://github.com/Financial-Times/polyfill-library/pull/1709)
- improve test coverage for Array.prototype.keys [`#1631`](https://github.com/Financial-Times/polyfill-library/pull/1631)
- Server Number.isInteger polyfill to Chrome 19-33 [`#1703`](https://github.com/Financial-Times/polyfill-library/pull/1703)
- Serve HTMLCanvasElement.prototype.toBlob to Edge and don't serve to Safari 11 [`#1704`](https://github.com/Financial-Times/polyfill-library/pull/1704)
- update Yaku version to support Promise polyfilling in Web Worker [`#1701`](https://github.com/Financial-Times/polyfill-library/pull/1701)
- Don't add the outer closure if no polyfills need to be served [`#1695`](https://github.com/Financial-Times/polyfill-library/pull/1695)
- improve tests for setimmediate [`#1665`](https://github.com/Financial-Times/polyfill-library/pull/1665)
- Update docs.js ---- use req.protocol instead of fixed 'https' [`#1694`](https://github.com/Financial-Times/polyfill-library/pull/1694)
- Split into polyfill-library and polyfill-service [`#1693`](https://github.com/Financial-Times/polyfill-library/pull/1693)
- Add option to skip mounting tests [`#1687`](https://github.com/Financial-Times/polyfill-library/pull/1687)
- improve tests for set [`#1648`](https://github.com/Financial-Times/polyfill-library/pull/1648)
- Improve tests for promise.prototype.finally [`#1646`](https://github.com/Financial-Times/polyfill-library/pull/1646)
- improve test coverage for Array.prototype.values [`#1625`](https://github.com/Financial-Times/polyfill-library/pull/1625)
- improve symbol tests [`#1621`](https://github.com/Financial-Times/polyfill-library/pull/1621)
- Weakmap [`#1620`](https://github.com/Financial-Times/polyfill-library/pull/1620)
- improve test coverage for weakset [`#1619`](https://github.com/Financial-Times/polyfill-library/pull/1619)
- update sinh [`#1677`](https://github.com/Financial-Times/polyfill-library/pull/1677)
- improve tests for string.prototype.fromcodepoint [`#1666`](https://github.com/Financial-Times/polyfill-library/pull/1666)
- improve tests for string.prototype.endswith [`#1670`](https://github.com/Financial-Times/polyfill-library/pull/1670)
- Add tests for math.cosh [`#1653`](https://github.com/Financial-Times/polyfill-library/pull/1653)
- Add tests for math.hypot [`#1651`](https://github.com/Financial-Times/polyfill-library/pull/1651)
- Add tests for math.expm1 [`#1652`](https://github.com/Financial-Times/polyfill-library/pull/1652)
- Improve tests for math.log2 [`#1649`](https://github.com/Financial-Times/polyfill-library/pull/1649)
- Add tests for math.atanh [`#1656`](https://github.com/Financial-Times/polyfill-library/pull/1656)
- Add tests for math.cbrt [`#1655`](https://github.com/Financial-Times/polyfill-library/pull/1655)
- Improve tests for string.prototype.startswith [`#1675`](https://github.com/Financial-Times/polyfill-library/pull/1675)
- Improve tests for string.prototype.trim [`#1676`](https://github.com/Financial-Times/polyfill-library/pull/1676)
- Add tests for math.sign [`#1650`](https://github.com/Financial-Times/polyfill-library/pull/1650)
- Improve tests for math.clz32 [`#1654`](https://github.com/Financial-Times/polyfill-library/pull/1654)
- Add tests for math.tanh [`#1657`](https://github.com/Financial-Times/polyfill-library/pull/1657)
- Add tests for math.trunc [`#1658`](https://github.com/Financial-Times/polyfill-library/pull/1658)
- Improve tests in number.isinteger [`#1659`](https://github.com/Financial-Times/polyfill-library/pull/1659)
- Improve tests for number.isnan [`#1660`](https://github.com/Financial-Times/polyfill-library/pull/1660)
- Improve number.issafeinteger tests [`#1661`](https://github.com/Financial-Times/polyfill-library/pull/1661)
- Add test for object.defineproperties [`#1662`](https://github.com/Financial-Times/polyfill-library/pull/1662)
- improve tests for string.prototype.@@iterator [`#1667`](https://github.com/Financial-Times/polyfill-library/pull/1667)
- improve tests for string.prototype.codepointat [`#1668`](https://github.com/Financial-Times/polyfill-library/pull/1668)
- Add tests for string.prototype.contains [`#1669`](https://github.com/Financial-Times/polyfill-library/pull/1669)
- improve tests for string.prototype.includes [`#1671`](https://github.com/Financial-Times/polyfill-library/pull/1671)
- improve tests for string.prototype.padend [`#1672`](https://github.com/Financial-Times/polyfill-library/pull/1672)
- Improve tests for string.prototype.padstart [`#1673`](https://github.com/Financial-Times/polyfill-library/pull/1673)
- Improve tests for string.prototype.repeat [`#1674`](https://github.com/Financial-Times/polyfill-library/pull/1674)
- Use new test helpers for Array.of tests [`#1607`](https://github.com/Financial-Times/polyfill-library/pull/1607)
- Simlpify tests for Array.prototype.contains [`#1609`](https://github.com/Financial-Times/polyfill-library/pull/1609)
- Simplify tests for Array.prototype[Symbol.iterator] [`#1608`](https://github.com/Financial-Times/polyfill-library/pull/1608)
- improve test coverage for Array.prototype.find [`#1610`](https://github.com/Financial-Times/polyfill-library/pull/1610)
- improve test coverage for Array.prototype.findindex [`#1611`](https://github.com/Financial-Times/polyfill-library/pull/1611)
- improve test coverage for Array.prototype.every [`#1613`](https://github.com/Financial-Times/polyfill-library/pull/1613)
- improve test coverage for Array.prototype.filter [`#1615`](https://github.com/Financial-Times/polyfill-library/pull/1615)
- improve test coverage for Array.prototype.foreach [`#1612`](https://github.com/Financial-Times/polyfill-library/pull/1612)
- improve test coverage for Array.prototype.fill [`#1614`](https://github.com/Financial-Times/polyfill-library/pull/1614)
- Use new test helpers for Array.isArray tests [`#1616`](https://github.com/Financial-Times/polyfill-library/pull/1616)
- improve test coverage for Array.prototype.copyWithin tests [`#1617`](https://github.com/Financial-Times/polyfill-library/pull/1617)
- improve test coverage for Array.prototype.entries [`#1618`](https://github.com/Financial-Times/polyfill-library/pull/1618)
- improve test coverage for Map [`#1622`](https://github.com/Financial-Times/polyfill-library/pull/1622)
- improve test coverage for Math.acosh [`#1623`](https://github.com/Financial-Times/polyfill-library/pull/1623)
- improve test coverage for Math.asinh [`#1624`](https://github.com/Financial-Times/polyfill-library/pull/1624)
- improve test coverage for Date.prototype.toISOString [`#1626`](https://github.com/Financial-Times/polyfill-library/pull/1626)
- improve test coverage for Function.prototype.bind [`#1627`](https://github.com/Financial-Times/polyfill-library/pull/1627)
- improve test coverage for Array.prototype.reduce [`#1628`](https://github.com/Financial-Times/polyfill-library/pull/1628)
- improve test coverage for Array.prototype.reduceright [`#1629`](https://github.com/Financial-Times/polyfill-library/pull/1629)
- improve test coverage for Array.prototype.some [`#1630`](https://github.com/Financial-Times/polyfill-library/pull/1630)
- improve test coverage for Array.prototype.lastindexof [`#1632`](https://github.com/Financial-Times/polyfill-library/pull/1632)
- improve test coverage for Array.prototype.map [`#1633`](https://github.com/Financial-Times/polyfill-library/pull/1633)
- improve test coverage for Array.prototype.includes [`#1634`](https://github.com/Financial-Times/polyfill-library/pull/1634)
- improve test coverage for Array.prototype.indexof [`#1635`](https://github.com/Financial-Times/polyfill-library/pull/1635)
- imrpove tests for object.entries [`#1636`](https://github.com/Financial-Times/polyfill-library/pull/1636)
- improve tests for object.defineproperty [`#1637`](https://github.com/Financial-Times/polyfill-library/pull/1637)
- improve tests for number.isfinite [`#1638`](https://github.com/Financial-Times/polyfill-library/pull/1638)
- add tests for object.getprototypeof [`#1639`](https://github.com/Financial-Times/polyfill-library/pull/1639)
- improve tests for object.getownpropertynames [`#1640`](https://github.com/Financial-Times/polyfill-library/pull/1640)
- improve tests for object.freeze [`#1641`](https://github.com/Financial-Times/polyfill-library/pull/1641)
- improve tests for object.values [`#1642`](https://github.com/Financial-Times/polyfill-library/pull/1642)
- improve tests object.setprototypeof [`#1643`](https://github.com/Financial-Times/polyfill-library/pull/1643)
- Add tests for object.is [`#1644`](https://github.com/Financial-Times/polyfill-library/pull/1644)
- add getter tests for regexp.prototype.flags [`#1645`](https://github.com/Financial-Times/polyfill-library/pull/1645)
- Use custom proclaim assertions for testing Array.from [`#1601`](https://github.com/Financial-Times/polyfill-library/pull/1601)
- Rewrite WeakSet to be spec compliant and use es abstract methods [`#1582`](https://github.com/Financial-Times/polyfill-library/pull/1582)
- Rewrite Set to be spec compliant and use es abstract methods [`#1574`](https://github.com/Financial-Times/polyfill-library/pull/1574)
- Rewrite WeakMap to be spec compliant and use es abstract methods [`#1583`](https://github.com/Financial-Times/polyfill-library/pull/1583)
- Rewrite Array.prototype.forEach to be spec compliant and use es abstract methods [`#1523`](https://github.com/Financial-Times/polyfill-library/pull/1523)
- Rewrite Math.sign to be spec compliant and use es abstract methods [`#1547`](https://github.com/Financial-Times/polyfill-library/pull/1547)
- Rewrite String.prototype.repeat to be spec compliant and use es abstract methods [`#1586`](https://github.com/Financial-Times/polyfill-library/pull/1586)
- Rewrite Function.prototype.bind to be spec compliant and use es abstract methods [`#1533`](https://github.com/Financial-Times/polyfill-library/pull/1533)
- Rewrite Map to be spec compliant and use es abstract methods [`#1534`](https://github.com/Financial-Times/polyfill-library/pull/1534)
- Rewrite Array.from to be spec compliant and use es abstract methods [`#1510`](https://github.com/Financial-Times/polyfill-library/pull/1510)
- Rewrite Object.defineProperty to be spec compliant and use es abstract methods [`#1563`](https://github.com/Financial-Times/polyfill-library/pull/1563)
- Rewrite Object.entries to be spec compliant and use es abstract methods [`#1564`](https://github.com/Financial-Times/polyfill-library/pull/1564)
- Rewrite Array.prototype.includes to be spec compliant and use es abstract methods [`#1524`](https://github.com/Financial-Times/polyfill-library/pull/1524)
- Rewrite String.prototype.trim to be spec compliant and use es abstract methods [`#1584`](https://github.com/Financial-Times/polyfill-library/pull/1584)
- Rewrite Object.freeze to be spec compliant and use es abstract methods [`#1565`](https://github.com/Financial-Times/polyfill-library/pull/1565)
- Rewrite Array.prototype.@@iterator to be spec compliant and use es abstract methods [`#1512`](https://github.com/Financial-Times/polyfill-library/pull/1512)
- Rewrite String.prototype.endsWith to be spec compliant and use es abstract methods [`#1590`](https://github.com/Financial-Times/polyfill-library/pull/1590)
- Rewrite Object.defineProperties to be spec compliant and use es abstract methods [`#1562`](https://github.com/Financial-Times/polyfill-library/pull/1562)
- Rewrite Object.create to be spec compliant and use es abstract methods [`#1561`](https://github.com/Financial-Times/polyfill-library/pull/1561)
- Rewrite Array.prototype.copyWithin to be spec compliant and use es abstract methods [`#1516`](https://github.com/Financial-Times/polyfill-library/pull/1516)
- Rewrite String.prototype.iterator to be spec compliant and use es abstract methods [`#1577`](https://github.com/Financial-Times/polyfill-library/pull/1577)
- Rewrite Number.isSafeInteger to be spec compliant and use es abstract methods [`#1555`](https://github.com/Financial-Times/polyfill-library/pull/1555)
- Rewrite Object.getPrototypeOf to be spec compliant and use es abstract methods [`#1568`](https://github.com/Financial-Times/polyfill-library/pull/1568)
- Rewrite Object.setPrototypeOf to be spec compliant and use es abstract methods [`#1570`](https://github.com/Financial-Times/polyfill-library/pull/1570)
- Rewrite Promise.prototype.finally to be spec compliant and use es abstract methods [`#1572`](https://github.com/Financial-Times/polyfill-library/pull/1572)
- Rewrite String.fromCodePoint to be spec compliant and use es abstract methods [`#1575`](https://github.com/Financial-Times/polyfill-library/pull/1575)
- Rewrite Array.prototype.reduceRight to be spec compliant and use es abstract methods [`#1530`](https://github.com/Financial-Times/polyfill-library/pull/1530)
- Rewrite Array.prototype.some to be spec compliant and use es abstract methods [`#1531`](https://github.com/Financial-Times/polyfill-library/pull/1531)
- Rewrite Math.asinh to be spec compliant and use es abstract methods [`#1536`](https://github.com/Financial-Times/polyfill-library/pull/1536)
- Rewrite Math.acosh to be spec compliant and use es abstract methods [`#1535`](https://github.com/Financial-Times/polyfill-library/pull/1535)
- Rewrite Math.atanh to be spec compliant and use es abstract methods [`#1537`](https://github.com/Financial-Times/polyfill-library/pull/1537)
- Rewrite Math.cbrt to be spec compliant and use es abstract methods [`#1538`](https://github.com/Financial-Times/polyfill-library/pull/1538)
- Rewrite Object.getOwnPropertyDescriptor to be spec compliant and use es abstract methods [`#1566`](https://github.com/Financial-Times/polyfill-library/pull/1566)
- Rewrite Object.values to be spec compliant and use es abstract methods [`#1571`](https://github.com/Financial-Times/polyfill-library/pull/1571)
- Rewrite Object.getOwnPropertyNames to be spec compliant and use es abstract methods [`#1567`](https://github.com/Financial-Times/polyfill-library/pull/1567)
- Rewrite Array.of to be spec compliant and use es abstract methods [`#1576`](https://github.com/Financial-Times/polyfill-library/pull/1576)
- Rewrite RegExp.prototype.flags to be spec compliant and use es abstract methods [`#1573`](https://github.com/Financial-Times/polyfill-library/pull/1573)
- Rewrite String.prototype.includes to be spec compliant and use es abstract methods [`#1589`](https://github.com/Financial-Times/polyfill-library/pull/1589)
- Rewrite String.prototype.startsWith to be spec compliant and use es abstract methods [`#1585`](https://github.com/Financial-Times/polyfill-library/pull/1585)
- Rewrite String.prototype.codePointAt to be spec compliant and use es abstract methods [`#1592`](https://github.com/Financial-Times/polyfill-library/pull/1592)
- Remove array.of from gitignore [`#1579`](https://github.com/Financial-Times/polyfill-library/pull/1579)
- Rewrite Array.prototype.findIndex to be spec compliant and use es abstract methods [`#1522`](https://github.com/Financial-Times/polyfill-library/pull/1522)
- Rewrite Array.prototype.filter to be spec compliant and use es abstract methods [`#1520`](https://github.com/Financial-Times/polyfill-library/pull/1520)
- Rewrite Number.isNaN to be spec compliant and use es abstract methods [`#1554`](https://github.com/Financial-Times/polyfill-library/pull/1554)
- Rewrite Math.clz32 to be spec compliant and use es abstract methods [`#1539`](https://github.com/Financial-Times/polyfill-library/pull/1539)
- Rewrite Math.cosh to be spec compliant and use es abstract methods [`#1540`](https://github.com/Financial-Times/polyfill-library/pull/1540)
- Rewrite Math.expm1 to be spec compliant and use es abstract methods [`#1541`](https://github.com/Financial-Times/polyfill-library/pull/1541)
- Rewrite Math.hypot to be spec compliant and use es abstract methods [`#1542`](https://github.com/Financial-Times/polyfill-library/pull/1542)
- Rewrite Math.imul to be spec compliant and use es abstract methods [`#1543`](https://github.com/Financial-Times/polyfill-library/pull/1543)
- Rewrite Math.log2 to be spec compliant and use es abstract methods [`#1546`](https://github.com/Financial-Times/polyfill-library/pull/1546)
- Rewrite Math.sinh to be spec compliant and use es abstract methods [`#1548`](https://github.com/Financial-Times/polyfill-library/pull/1548)
- Rewrite Math.tanh to be spec compliant and use es abstract methods [`#1549`](https://github.com/Financial-Times/polyfill-library/pull/1549)
- Rewrite Math.trunc to be spec compliant and use es abstract methods [`#1550`](https://github.com/Financial-Times/polyfill-library/pull/1550)
- Rewrite Math.log10 to be spec compliant and use es abstract methods [`#1544`](https://github.com/Financial-Times/polyfill-library/pull/1544)
- Rewrite Math.log1p to be spec compliant and use es abstract methods [`#1545`](https://github.com/Financial-Times/polyfill-library/pull/1545)
- Rewrite Number.parseFloat to be spec compliant and use es abstract methods [`#1558`](https://github.com/Financial-Times/polyfill-library/pull/1558)
- Rewrite Object.is to be spec compliant and use es abstract methods [`#1569`](https://github.com/Financial-Times/polyfill-library/pull/1569)
- Rewrite Number.parseInt to be spec compliant and use es abstract methods [`#1559`](https://github.com/Financial-Times/polyfill-library/pull/1559)
- Rewrite Number.MIN_SAFE_INTEGER to be spec compliant and use es abstract methods [`#1557`](https://github.com/Financial-Times/polyfill-library/pull/1557)
- Rewrite String.prototype.padEnd to be spec compliant and use es abstract methods [`#1588`](https://github.com/Financial-Times/polyfill-library/pull/1588)
- Rewrite Array.prototype.map to be spec compliant and use es abstract methods [`#1528`](https://github.com/Financial-Times/polyfill-library/pull/1528)
- Rewrite Array.prototype.find to be spec compliant and use es abstract methods [`#1521`](https://github.com/Financial-Times/polyfill-library/pull/1521)
- Rewrite String.prototype.contains to be spec compliant and use es abstract methods [`#1591`](https://github.com/Financial-Times/polyfill-library/pull/1591)
- Rewrite Array.prototype.reduce to be spec compliant and use es abstract methods [`#1529`](https://github.com/Financial-Times/polyfill-library/pull/1529)
- Rewrite String.prototype.padStart to be spec compliant and use es abstract methods [`#1587`](https://github.com/Financial-Times/polyfill-library/pull/1587)
- Rewrite Array.prototype.fill to be spec compliant and use es abstract methods [`#1519`](https://github.com/Financial-Times/polyfill-library/pull/1519)
- Rewrite Object.assign to be spec compliant and use es abstract methods [`#1560`](https://github.com/Financial-Times/polyfill-library/pull/1560)
- Filter out unused abstract methods from the bundle after filtering out excluded and not-required polyfills [`#1581`](https://github.com/Financial-Times/polyfill-library/pull/1581)
- Rewrite Number.isInteger to be spec compliant and use es abstract methods [`#1553`](https://github.com/Financial-Times/polyfill-library/pull/1553)
- Rewrite Array.prototype.indexOf to be spec compliant and use es abstract methods [`#1525`](https://github.com/Financial-Times/polyfill-library/pull/1525)
- Rewrite Number.isFinite to be spec compliant and use es abstract methods [`#1552`](https://github.com/Financial-Times/polyfill-library/pull/1552)
- Rewrite Array.prototype.lastIndexOf to be spec compliant and use es abstract methods [`#1527`](https://github.com/Financial-Times/polyfill-library/pull/1527)
- Rewrite Number.MAX_SAFE_INTEGER to be spec compliant and use es abstract methods [`#1556`](https://github.com/Financial-Times/polyfill-library/pull/1556)
- Rewrite Array.prototype.values to be spec compliant and use es abstract methods [`#1532`](https://github.com/Financial-Times/polyfill-library/pull/1532)
- Rewrite Array.prototype.keys to be spec compliant and use es abstract methods [`#1526`](https://github.com/Financial-Times/polyfill-library/pull/1526)
- Add spec comment to Number.EPSILON [`#1551`](https://github.com/Financial-Times/polyfill-library/pull/1551)
- Rewrite Array.prototype.contains to be spec compliant and use es abstract methods [`#1515`](https://github.com/Financial-Times/polyfill-library/pull/1515)
- Remove ES6 features from linter [`#1514`](https://github.com/Financial-Times/polyfill-library/pull/1514)
- Rewrite Array.prototype.every to be spec compliant and use es abstract methods [`#1518`](https://github.com/Financial-Times/polyfill-library/pull/1518)
- Rewrite Array.isArray to be spec compliant and use es abstract methods [`#1511`](https://github.com/Financial-Times/polyfill-library/pull/1511)
- Turn off warning about using functions named like constructors without new operator [`#1513`](https://github.com/Financial-Times/polyfill-library/pull/1513)
- Rewrite Array.prototype.entries to be spec compliant and use es abstract methods [`#1517`](https://github.com/Financial-Times/polyfill-library/pull/1517)
- Remove incorrect test for userland defined iterator on Array.from [`#1509`](https://github.com/Financial-Times/polyfill-library/pull/1509)
- Removed zlib from dependencies [`#1420`](https://github.com/Financial-Times/polyfill-library/pull/1420)
- Add Blob polyfill [`#1443`](https://github.com/Financial-Times/polyfill-library/pull/1443)
- Make Object.entries tests use ES3 syntax to enable them to run in ES3 environments [`#1508`](https://github.com/Financial-Times/polyfill-library/pull/1508)
- Update event polyfill tests to run correctly on safari 5.1 [`#1439`](https://github.com/Financial-Times/polyfill-library/pull/1439)
- Update matchmedia detect to also check for existence of the MediaQueryList global [`#1442`](https://github.com/Financial-Times/polyfill-library/pull/1442)
- Add function to ensure a polyfill's declared dependencies do exist within the polyfill-service [`#1445`](https://github.com/Financial-Times/polyfill-library/pull/1445)
- Remove not helpful console.log statement that shows up in server logs [`#1441`](https://github.com/Financial-Times/polyfill-library/pull/1441)
- Add UTF16Decoding abstract operation [`#1455`](https://github.com/Financial-Times/polyfill-library/pull/1455)
- Add HasOwnProperty abstract operation [`#1453`](https://github.com/Financial-Times/polyfill-library/pull/1453)
- Add Call abstract operation [`#1451`](https://github.com/Financial-Times/polyfill-library/pull/1451)
- Add UTF16Encoding abstract operation [`#1454`](https://github.com/Financial-Times/polyfill-library/pull/1454)
- Add Get abstract operation [`#1452`](https://github.com/Financial-Times/polyfill-library/pull/1452)
- Add ToPrimitive abstract operation [`#1483`](https://github.com/Financial-Times/polyfill-library/pull/1483)
- Add ToIndex abstract operation [`#1485`](https://github.com/Financial-Times/polyfill-library/pull/1485)
- Add ToPropertyKey abstract operation [`#1482`](https://github.com/Financial-Times/polyfill-library/pull/1482)
- Add ArraySpeciesCreate abstract operation [`#1481`](https://github.com/Financial-Times/polyfill-library/pull/1481)
- Add ToUint8 abstract operation [`#1458`](https://github.com/Financial-Times/polyfill-library/pull/1458)
- Add Type abstract operation [`#1456`](https://github.com/Financial-Times/polyfill-library/pull/1456)
- Add IteratorClose abstract operation [`#1495`](https://github.com/Financial-Times/polyfill-library/pull/1495)
- Add IteratorNext abstract operation [`#1493`](https://github.com/Financial-Times/polyfill-library/pull/1493)
- Add SpeciesConstructor abstract operation [`#1486`](https://github.com/Financial-Times/polyfill-library/pull/1486)
- Add ToLength abstract operation [`#1484`](https://github.com/Financial-Times/polyfill-library/pull/1484)
- Add SameValueZero abstract operation [`#1487`](https://github.com/Financial-Times/polyfill-library/pull/1487)
- Add SameVaule abstract operation [`#1488`](https://github.com/Financial-Times/polyfill-library/pull/1488)
- Add OrdinaryToPrimitive abstract operation [`#1489`](https://github.com/Financial-Times/polyfill-library/pull/1489)
- Add OrdinaryCreateFromConstructor abstract operation [`#1490`](https://github.com/Financial-Times/polyfill-library/pull/1490)
- Add IteratorComplete abstract operation [`#1494`](https://github.com/Financial-Times/polyfill-library/pull/1494)
- Add IteratorStep abstract operation [`#1492`](https://github.com/Financial-Times/polyfill-library/pull/1492)
- Add IteratorValue abstract operation [`#1491`](https://github.com/Financial-Times/polyfill-library/pull/1491)
- Add IsRegExp abstract operation [`#1496`](https://github.com/Financial-Times/polyfill-library/pull/1496)
- Add IsConstructor abstract operation [`#1497`](https://github.com/Financial-Times/polyfill-library/pull/1497)
- Add Invoke abstract operation [`#1498`](https://github.com/Financial-Times/polyfill-library/pull/1498)
- Add GetV abstract operation [`#1499`](https://github.com/Financial-Times/polyfill-library/pull/1499)
- Add GetPrototypeFromConstructor abstract operation [`#1500`](https://github.com/Financial-Times/polyfill-library/pull/1500)
- Add EnumerableOwnProperties abstract operation [`#1503`](https://github.com/Financial-Times/polyfill-library/pull/1503)
- Add GetIterator abstract operation [`#1502`](https://github.com/Financial-Times/polyfill-library/pull/1502)
- Add GetMethod abstract operation [`#1501`](https://github.com/Financial-Times/polyfill-library/pull/1501)
- Add ToString abstract operation [`#1461`](https://github.com/Financial-Times/polyfill-library/pull/1461)
- Add CreateIterResultObject abstract operation [`#1504`](https://github.com/Financial-Times/polyfill-library/pull/1504)
- Add CreateDataPropertyOrThrow abstract operation [`#1505`](https://github.com/Financial-Times/polyfill-library/pull/1505)
- Add Construct abstract operation [`#1506`](https://github.com/Financial-Times/polyfill-library/pull/1506)
- Add ArrayCreate abstract operation [`#1450`](https://github.com/Financial-Times/polyfill-library/pull/1450)
- Add CanonicalNumericIndexString abstract operation [`#1507`](https://github.com/Financial-Times/polyfill-library/pull/1507)
- Add ToBoolean abstract operation [`#1468`](https://github.com/Financial-Times/polyfill-library/pull/1468)
- Add IsCallable abstract operation [`#1473`](https://github.com/Financial-Times/polyfill-library/pull/1473)
- Increase default concurrency for browser testing to 5 browsers [`#1480`](https://github.com/Financial-Times/polyfill-library/pull/1480)
- Add ToInt16 abstract operation [`#1466`](https://github.com/Financial-Times/polyfill-library/pull/1466)
- Add ToUint16 abstract operation [`#1460`](https://github.com/Financial-Times/polyfill-library/pull/1460)
- Add SameValueNonNumber abstract operation [`#1469`](https://github.com/Financial-Times/polyfill-library/pull/1469)
- Add ToInt8 abstract operation [`#1465`](https://github.com/Financial-Times/polyfill-library/pull/1465)
- Add ToInteger abstract operation [`#1464`](https://github.com/Financial-Times/polyfill-library/pull/1464)
- Add ToNumber abstract operation [`#1463`](https://github.com/Financial-Times/polyfill-library/pull/1463)
- Add ToObject abstract operation [`#1462`](https://github.com/Financial-Times/polyfill-library/pull/1462)
- Add BrowserStack logo as they are sponsoring the project [`#1478`](https://github.com/Financial-Times/polyfill-library/pull/1478)
- Added task to update BrowserStack browser list [`#1479`](https://github.com/Financial-Times/polyfill-library/pull/1479)
- Add IsArray abstract operation [`#1477`](https://github.com/Financial-Times/polyfill-library/pull/1477)
- Add CreateDataProperty abstract operation [`#1476`](https://github.com/Financial-Times/polyfill-library/pull/1476)
- Add IsPropertyKey abstract operation [`#1471`](https://github.com/Financial-Times/polyfill-library/pull/1471)
- Add RequireObjectCoercible abstract operation [`#1470`](https://github.com/Financial-Times/polyfill-library/pull/1470)
- Add ToInt32 abstract operation [`#1467`](https://github.com/Financial-Times/polyfill-library/pull/1467)
- Add ToUint32 abstract operation [`#1459`](https://github.com/Financial-Times/polyfill-library/pull/1459)
- Add CreateMethodProperty abstract operation [`#1475`](https://github.com/Financial-Times/polyfill-library/pull/1475)
- Add HasProperty abstract operation [`#1474`](https://github.com/Financial-Times/polyfill-library/pull/1474)
- Add IsInteger abstract operation [`#1472`](https://github.com/Financial-Times/polyfill-library/pull/1472)
- Add ToUint8Clamp abstract operation [`#1457`](https://github.com/Financial-Times/polyfill-library/pull/1457)
- remove handlebars from polyfill-library (#1800) [`#1792`](https://github.com/Financial-Times/polyfill-service/pull/1792)
- add polyfill for NodeList.forEach (#1710) [`#1686`](https://github.com/Financial-Times/polyfill-library/issues/1686) [`#1430`](https://github.com/Financial-Times/polyfill-library/issues/1430)
- Don't add the outer closure if no polyfills need to be served (#1695) [`#1685`](https://github.com/Financial-Times/polyfill-library/issues/1685)
- Get codebase ready for making releases to production [`f8bfc72`](https://github.com/Financial-Times/polyfill-library/commit/f8bfc7276251c908e22d507babab659755e90620)
- Add script to install heroku to circleci [`c01647a`](https://github.com/Financial-Times/polyfill-library/commit/c01647a66f6ee8bb5abfce65f4f9c71f8d4fb063)
- Add Heroku generated app.json [`b6de346`](https://github.com/Financial-Times/polyfill-library/commit/b6de3468fc127bad3824c033c96679cf56ed38aa)

#### v3.25.1

> 15 January 2018

- Friendlier errors when authoring polyfills [`#1440`](https://github.com/Financial-Times/polyfill-library/pull/1440)
- Add aliases for Object.getOwnPropertySymbols and Symbol.for & keyFor as Symbol polyfill implements these methods [`#1447`](https://github.com/Financial-Times/polyfill-library/pull/1447)
- Adding aliases for DataView and ArrayBuffer onto _TypedArray polyfill [`#1448`](https://github.com/Financial-Times/polyfill-library/pull/1448)
- Fix name of property by adding an alias, it is meant to be Number.EPSILON [`#1449`](https://github.com/Financial-Times/polyfill-library/pull/1449)
- Rewrite Map polyfill to be more spec compliant [`#1432`](https://github.com/Financial-Times/polyfill-library/pull/1432)
- Alias GoogleBot 2.1 to Chrome 41 [`#1433`](https://github.com/Financial-Times/polyfill-library/pull/1433)
- Fix Element.prototype.closest for elements inside inline SVGs [`#1425`](https://github.com/Financial-Times/polyfill-library/pull/1425)
- Remove Chrome 63+ from Promise Finally polyfill [`#1423`](https://github.com/Financial-Times/polyfill-library/pull/1423)
- Improving the Map polyfill descriptors [`#1419`](https://github.com/Financial-Times/polyfill-library/pull/1419)
- Improve the Map polyfills spec compliance [`#1413`](https://github.com/Financial-Times/polyfill-library/pull/1413)
- Modify the clean scripts for cross-platform compatibility [`#1412`](https://github.com/Financial-Times/polyfill-library/pull/1412)
- Improve the Set polyfills spec compliance [`#1411`](https://github.com/Financial-Times/polyfill-library/pull/1411)
- Add WeakMap polyfill to blissfuljs alias [`#1410`](https://github.com/Financial-Times/polyfill-library/pull/1410)
- add es6 tests for object assign [`#1395`](https://github.com/Financial-Times/polyfill-library/pull/1395)
- Re-enable RUM, using BigQuery [`#1402`](https://github.com/Financial-Times/polyfill-library/pull/1402)
- Do not serve devicePixelRatio to safari 9.1 or iOS 9.3 [`#1407`](https://github.com/Financial-Times/polyfill-library/pull/1407)
- Make Object.defineProperty work on objects without a prototype [`#1408`](https://github.com/Financial-Times/polyfill-library/pull/1408)
- Complex test case for setPrototypeOf [`#1396`](https://github.com/Financial-Times/polyfill-library/pull/1396)
- Add support contact details to origami.json [`#1404`](https://github.com/Financial-Times/polyfill-library/pull/1404)
- build the polyfills after installing the project as we ingore the `__dist` directory from npm and git [`#1398`](https://github.com/Financial-Times/polyfill-library/pull/1398)
- Update the tests after unning on Samsung Internet 6.2 which has the Chromium v56 Engine, with some features from 57. [`#1397`](https://github.com/Financial-Times/polyfill-library/pull/1397)
- Fail the feature detect for localstorage if we are in safari private browser [`#1345`](https://github.com/Financial-Times/polyfill-library/pull/1345)
- Make the method non-enumerable, fixes #1333 [`#1393`](https://github.com/Financial-Times/polyfill-library/pull/1393)
- `Event.focusin` is supported in Firefox and Firefox Mobile since Version 52. [`#1383`](https://github.com/Financial-Times/polyfill-library/pull/1383)
- dont polyfill if inside a web worker, fixes #1292 [`#1394`](https://github.com/Financial-Times/polyfill-library/pull/1394)
- Improve DOMTokenList interface by supporting multiple arguments [`#1347`](https://github.com/Financial-Times/polyfill-library/pull/1347)
- Do not set XMLHttpRequest.responseType in navigator.sendBeacon [`#1382`](https://github.com/Financial-Times/polyfill-library/pull/1382)
- Update engines to node 9 [`#1389`](https://github.com/Financial-Times/polyfill-library/pull/1389)
- Add `iterable` support for `Map` and `Set` iterators. [`#1385`](https://github.com/Financial-Times/polyfill-library/pull/1385)
- updates HTMLPictureElement config as ie 13, safari 9.1 and ios_saf 9.3 have shipped support. [`#1378`](https://github.com/Financial-Times/polyfill-library/pull/1378)
- Add whitesource task and run it on CI [`#1381`](https://github.com/Financial-Times/polyfill-library/pull/1381)
- Add Typed arrays polyfill [`#1374`](https://github.com/Financial-Times/polyfill-library/pull/1374)
- update js-polyfill to get opera mini url fix [`#1375`](https://github.com/Financial-Times/polyfill-library/pull/1375)
- Add RegExp.prototype.flags polyfill [`#1372`](https://github.com/Financial-Times/polyfill-library/pull/1372)
- Add String.prototype.codePointAt polyfill [`#1373`](https://github.com/Financial-Times/polyfill-library/pull/1373)
- Add Array.prototype.copyWithin [`#1371`](https://github.com/Financial-Times/polyfill-library/pull/1371)
- Add Number.isSafeInteger polyfill [`#1369`](https://github.com/Financial-Times/polyfill-library/pull/1369)
- Add Number.EPSILON polyfill [`#1368`](https://github.com/Financial-Times/polyfill-library/pull/1368)
- Update/Swap dependencies for versions which do not have vulnerabilities in them according to WhiteSource [`#1366`](https://github.com/Financial-Times/polyfill-library/pull/1366)
- Enable `URL` polyfill for all versions of Opera Mini. [`#1349`](https://github.com/Financial-Times/polyfill-library/pull/1349)
- Add spaces around the dash to ensure it is used as a semver range [`#1365`](https://github.com/Financial-Times/polyfill-library/pull/1365)
- fix(UA): add alias for modern yandex [`#1357`](https://github.com/Financial-Times/polyfill-library/pull/1357)
- Remove sourcemapURL comments from polyfills [`#1283`](https://github.com/Financial-Times/polyfill-library/pull/1283)
- Enable backends to be over-ridden by x-origin-env [`#1352`](https://github.com/Financial-Times/polyfill-library/pull/1352)
- update mocha, request and request-promise [`#1350`](https://github.com/Financial-Times/polyfill-library/pull/1350)
- Enable `Symbol`polyfill for all versions of Opera Mini. [`#1344`](https://github.com/Financial-Times/polyfill-library/pull/1344)
- Reduce variance in QA/prod code paths [`#1328`](https://github.com/Financial-Times/polyfill-library/pull/1328)
- Allow the `SENTRY_RELEASE` environment variable to be used (#1335) [`#1336`](https://github.com/Financial-Times/polyfill-library/pull/1336)
- Add es2016 alias to all polyfills aliased as es7 [`#1339`](https://github.com/Financial-Times/polyfill-library/pull/1339)
- Stop polyfill IntersectionObserver for FF &gt;= 55 [`#1340`](https://github.com/Financial-Times/polyfill-library/pull/1340)
- Only create RUM report if a RUM database exists [`#1338`](https://github.com/Financial-Times/polyfill-library/pull/1338)
- Add privacy-policy and T&Cs pages [`#1331`](https://github.com/Financial-Times/polyfill-library/pull/1331)
- Revert "Remove codepaths which are never executed (#1325)" [`#1326`](https://github.com/Financial-Times/polyfill-library/pull/1326)
- Remove codepaths which are never executed [`#1325`](https://github.com/Financial-Times/polyfill-library/pull/1325)
- use variable according to spec [`#1322`](https://github.com/Financial-Times/polyfill-library/pull/1322)
- Only remove the single item being requsted for removal [`#1312`](https://github.com/Financial-Times/polyfill-library/pull/1312)
- Remove unused function [`#1311`](https://github.com/Financial-Times/polyfill-library/pull/1311)
- Add favicon magic [`#1310`](https://github.com/Financial-Times/polyfill-library/pull/1310)
- only declare handler variable once [`#1315`](https://github.com/Financial-Times/polyfill-library/pull/1315)
- declare variable only once [`#1313`](https://github.com/Financial-Times/polyfill-library/pull/1313)
- do not redeclare variable [`#1314`](https://github.com/Financial-Times/polyfill-library/pull/1314)
- fix typo [`#1323`](https://github.com/Financial-Times/polyfill-library/pull/1323)
- Remove unused variable [`#1324`](https://github.com/Financial-Times/polyfill-library/pull/1324)
- remove unusued variable [`#1316`](https://github.com/Financial-Times/polyfill-library/pull/1316)
- remove duplicated variable declaration [`#1317`](https://github.com/Financial-Times/polyfill-library/pull/1317)
- bodyCheck takes 0 arguments [`#1318`](https://github.com/Financial-Times/polyfill-library/pull/1318)
- Remove the double assignment [`#1320`](https://github.com/Financial-Times/polyfill-library/pull/1320)
- Remove code which is never reached [`#1319`](https://github.com/Financial-Times/polyfill-library/pull/1319)
- Remove unused variable [`#1321`](https://github.com/Financial-Times/polyfill-library/pull/1321)
- remove unused assignment [`#1309`](https://github.com/Financial-Times/polyfill-library/pull/1309)
- Remove unused parameter [`#1308`](https://github.com/Financial-Times/polyfill-library/pull/1308)
- Remove unused variables [`#1307`](https://github.com/Financial-Times/polyfill-library/pull/1307)
- Use html entity for &lt; and use code tags for ` [`#1306`](https://github.com/Financial-Times/polyfill-library/pull/1306)
- Remove unused parameter [`#1304`](https://github.com/Financial-Times/polyfill-library/pull/1304)
- Replace Function constructor call with a real VM execution [`#1303`](https://github.com/Financial-Times/polyfill-library/pull/1303)
- Remove code branch which can never be reached [`#1302`](https://github.com/Financial-Times/polyfill-library/pull/1302)
- Support Objects which have Symbol.iterator defined [`#1293`](https://github.com/Financial-Times/polyfill-library/pull/1293)
- Fix: Do not call callback for Map.prototype.forEach if no map entries exist [`#1300`](https://github.com/Financial-Times/polyfill-library/pull/1300)
- revert ea0ecde3c9d7f9b466461042819184658f15ef1c [`#1290`](https://github.com/Financial-Times/polyfill-library/pull/1290)
- Add Object.freeze polyfill [`#1297`](https://github.com/Financial-Times/polyfill-library/pull/1297)
- Alias modern opera to version of chrome they are using [`#1296`](https://github.com/Financial-Times/polyfill-library/pull/1296)
- Set Symbol.toStringTag to be writable to make this polyfill spec compliant and to work with generator polyfills [`#1295`](https://github.com/Financial-Times/polyfill-library/pull/1295)
- Add es2015 aliases to all polyfills aliased as es6 [`#1287`](https://github.com/Financial-Times/polyfill-library/pull/1287)
- Ensure Maps and Sets have correct constructor references, fixes #1161 [`#1178`](https://github.com/Financial-Times/polyfill-library/pull/1178)
- Make Element.prototype.closest work for SVG nodes in IE11) [`#1285`](https://github.com/Financial-Times/polyfill-library/pull/1285)
- Move to CircleCI 2 workflows for faster builds [`#1286`](https://github.com/Financial-Times/polyfill-library/pull/1286)
- Array.from working with IE11 native Set - issue #1259 [`#1260`](https://github.com/Financial-Times/polyfill-library/pull/1260)
- Object keys es6 implementation [`#1033`](https://github.com/Financial-Times/polyfill-library/pull/1033)
- Polyfill prepend for DocumentFragment [`#1158`](https://github.com/Financial-Times/polyfill-library/pull/1158)
- Add tests for ES5 version of Object.assign [`#1284`](https://github.com/Financial-Times/polyfill-library/pull/1284)
- Remove sourcemapURL comments from polyfills [`#1283`](https://github.com/Financial-Times/polyfill-library/pull/1283)
- Set the age header to 0 before sending the request back to the browser [`#1282`](https://github.com/Financial-Times/polyfill-library/pull/1282)
- updated Symbol to detect ios safari lt version 9 [`#1186`](https://github.com/Financial-Times/polyfill-library/pull/1186)
- .after spec [`#1270`](https://github.com/Financial-Times/polyfill-library/pull/1270)
- avoid setting read-only function length properties [`#1281`](https://github.com/Financial-Times/polyfill-library/pull/1281)
- Enable `Map`, `Set`, `Array.includes` and `String.includes` polyfils for all versions of Opera Mini. [`#1064`](https://github.com/Financial-Times/polyfill-library/pull/1064)
- take more cases in _mutation for older browsers [`#1280`](https://github.com/Financial-Times/polyfill-library/pull/1280)
- [fix] add `append(...args)` to fragments too [`#1272`](https://github.com/Financial-Times/polyfill-library/pull/1272)
- non-node are accepted and converted as Text [`#1269`](https://github.com/Financial-Times/polyfill-library/pull/1269)
- Add URL polyfill to Chrome 49 ~50 [`#1254`](https://github.com/Financial-Times/polyfill-library/pull/1254)
- Use typeof callback === 'function' instead of instanceof [`#1253`](https://github.com/Financial-Times/polyfill-library/pull/1253)
- Remove the note about `searchParams` not being iterable [`#1249`](https://github.com/Financial-Times/polyfill-library/pull/1249)
- Chrome 45 - Polyfill Object.assign and Array.prototype.find [`#1278`](https://github.com/Financial-Times/polyfill-library/pull/1278)
- String.prototype.padStart.length should be 1 - 2nd argument is optional which means it should not count towards function's length property [`#1263`](https://github.com/Financial-Times/polyfill-library/pull/1263)
- String.prototype.padEnd.length should be 1 - 2nd argument is optional which means it should not count towards function's length property [`#1262`](https://github.com/Financial-Times/polyfill-library/pull/1262)
- No versions of IE support toBlob [`#1258`](https://github.com/Financial-Times/polyfill-library/pull/1258)
- fix: requestAnimationFrame is not supported in any android version [`#1271`](https://github.com/Financial-Times/polyfill-library/pull/1271)
- To avoid an error where console is undefined, check that console exists before checking a console method exists [`#1277`](https://github.com/Financial-Times/polyfill-library/pull/1277)
- Add DocumentFragment polyfill [`#1261`](https://github.com/Financial-Times/polyfill-library/pull/1261)
- Fix NODE_ENV doc [`#1266`](https://github.com/Financial-Times/polyfill-library/pull/1266)
- Function.name is available since at least chrome 15 [`#1248`](https://github.com/Financial-Times/polyfill-library/pull/1248)
- Stop serving IO polyfill to Edge 15 [`#1235`](https://github.com/Financial-Times/polyfill-library/pull/1235)
- Fix incorrect work addListener() and removeListener() methods in MediaQueryList [`#1086`](https://github.com/Financial-Times/polyfill-library/pull/1086)
- Add MediaQueryList to global [`#1085`](https://github.com/Financial-Times/polyfill-library/pull/1085)
- Update Array.prototype.values config for Firefox [`#1103`](https://github.com/Financial-Times/polyfill-library/pull/1103)
- Enable service to work correctly when hosted on a path [`#1094`](https://github.com/Financial-Times/polyfill-library/pull/1094)
- Default value of deep parameter should be false (Fixes #1189) [`#1190`](https://github.com/Financial-Times/polyfill-library/pull/1190)
- Object.values is only available on &gt;= chrome 54 [`#1218`](https://github.com/Financial-Times/polyfill-library/pull/1218)
- Add missing XMLHttpRequest state code [`#1184`](https://github.com/Financial-Times/polyfill-library/pull/1184)
- Object.entries is only available on chrome 54+ [`#1219`](https://github.com/Financial-Times/polyfill-library/pull/1219)
- start using npm5 lockfile format now that node8 has been released [`#1221`](https://github.com/Financial-Times/polyfill-library/pull/1221)
- Removed unused dependencies (Fixes #1229) [`#1234`](https://github.com/Financial-Times/polyfill-library/pull/1234)
- Fix pointing _keys and _values to the same object after clear [`#1227`](https://github.com/Financial-Times/polyfill-library/pull/1227)
- Docs: Fix feature search [`#1232`](https://github.com/Financial-Times/polyfill-library/pull/1232)
- Update compat.json file [`#1228`](https://github.com/Financial-Times/polyfill-library/pull/1228)
- Do not run compat test on android 4.3 or 4.2 as they are not working correctly on browserstack [`#1226`](https://github.com/Financial-Times/polyfill-library/pull/1226)
- Do not use the callback value if it is not a string [`#1225`](https://github.com/Financial-Times/polyfill-library/pull/1225)
- Fix script injection in 'unknown' parameter inside library [`#1224`](https://github.com/Financial-Times/polyfill-library/pull/1224)
- Fix script injection in 'unknown' parameter [`#1223`](https://github.com/Financial-Times/polyfill-library/pull/1223)
- update browser testing list [`#1220`](https://github.com/Financial-Times/polyfill-library/pull/1220)
- Add Samsung target to String pad polyfills. [`#1215`](https://github.com/Financial-Times/polyfill-library/pull/1215)
- Do not include fetch in latest safari and safari ios versions [`#1214`](https://github.com/Financial-Times/polyfill-library/pull/1214)
- Fix Set.prototype[@@iterator] [`#1217`](https://github.com/Financial-Times/polyfill-library/pull/1217)
- make cache hit ratio chart use data for 7 days instead of 180 days [`#1206`](https://github.com/Financial-Times/polyfill-library/pull/1206)
- Optimize the size tracking operations in the Map/Set polyfills [`#1157`](https://github.com/Financial-Times/polyfill-library/pull/1157)
- Add web animation polyfill [`#1072`](https://github.com/Financial-Times/polyfill-library/pull/1072)
- Prevent Event being applied in web workers, fixes #1110 [`#1146`](https://github.com/Financial-Times/polyfill-library/pull/1146)
- Add a feature detect for mutationobserver, fixes #1155 [`#1179`](https://github.com/Financial-Times/polyfill-library/pull/1179)
- deploy to US staging as well as EU [`#1195`](https://github.com/Financial-Times/polyfill-library/pull/1195)
- Enable load-balancing logic for qa service [`#1191`](https://github.com/Financial-Times/polyfill-library/pull/1191)
- Add a contribution scenario for reporting errors in polyfills [`#1177`](https://github.com/Financial-Times/polyfill-library/pull/1177)
- Prevent Map/Set polyfills from failing on UCBrowser (#1172) [`#1173`](https://github.com/Financial-Times/polyfill-library/pull/1173)
- `checked` property is not present on input[type=text] [`#1188`](https://github.com/Financial-Times/polyfill-library/pull/1188)
- Safari 9 does not have native nodelist.prototype[Symbol.iterator] support [`#1176`](https://github.com/Financial-Times/polyfill-library/pull/1176)
- update yaku to 0.17.11 [`#1175`](https://github.com/Financial-Times/polyfill-library/pull/1175)
- Abstract out iteration, add String iteration [`#1165`](https://github.com/Financial-Times/polyfill-library/pull/1165)
- run each draw function when they are ready [`#1164`](https://github.com/Financial-Times/polyfill-library/pull/1164)
- UA parsing for Facebook and Electron, fixes #990, #1129 [`#1147`](https://github.com/Financial-Times/polyfill-library/pull/1147)
- Add String.fromCodePoint polyfill [`#1152`](https://github.com/Financial-Times/polyfill-library/pull/1152)
- Fix #1045 - s/protoype/prototype/ [`#1149`](https://github.com/Financial-Times/polyfill-library/pull/1149)
- raise minimum version of yaku used in service [`#1150`](https://github.com/Financial-Times/polyfill-library/pull/1150)
- Make contains non-enumerable [`#1141`](https://github.com/Financial-Times/polyfill-library/pull/1141)
- Cache content on CDN for a year, soft purge from CDN when deploying [`#1145`](https://github.com/Financial-Times/polyfill-library/pull/1145)
- Stop tests route from blocking the event loop with sync fs methods [`#1144`](https://github.com/Financial-Times/polyfill-library/pull/1144)
- whatwg-fetch@2.0.3, with update script [`#1133`](https://github.com/Financial-Times/polyfill-library/pull/1133)
- Require handles relative paths [`#1140`](https://github.com/Financial-Times/polyfill-library/pull/1140)
- Add start of integration tests [`#1139`](https://github.com/Financial-Times/polyfill-library/pull/1139)
- Add unit tests for library code [`#1092`](https://github.com/Financial-Times/polyfill-library/pull/1092)
- Polyfill String.prototype.padStart and String.prototype.padEnd [`#1117`](https://github.com/Financial-Times/polyfill-library/pull/1117)
- Updated config.json [`#1078`](https://github.com/Financial-Times/polyfill-library/pull/1078)
- Add EventSource polyfill [`#1073`](https://github.com/Financial-Times/polyfill-library/pull/1073)
- fix shrinkwrap of dependencies [`#1136`](https://github.com/Financial-Times/polyfill-library/pull/1136)
- add polyfill of Object.values [`#1082`](https://github.com/Financial-Times/polyfill-library/pull/1082)
- Use brotli compression if browser supports it [`#1132`](https://github.com/Financial-Times/polyfill-library/pull/1132)
- Add some extra security headers [`#1131`](https://github.com/Financial-Times/polyfill-library/pull/1131)
- Update advice on importing third party polyfills [`#1130`](https://github.com/Financial-Times/polyfill-library/pull/1130)
- Only execute the supportedLocalesOf methods if they exist - Fixes #1125 [`#1126`](https://github.com/Financial-Times/polyfill-library/pull/1126)
- Add latest browser versions to test runner [`#1128`](https://github.com/Financial-Times/polyfill-library/pull/1128)
- Set IntersectionObserver to not yet shipped for FF [`#1120`](https://github.com/Financial-Times/polyfill-library/pull/1120)
- Set the Host header in order to let Heroku's router know which app to route to [`#1127`](https://github.com/Financial-Times/polyfill-library/pull/1127)
- Fix UA detection for wkwebview [`#1124`](https://github.com/Financial-Times/polyfill-library/pull/1124)
- include subdomains in hsts and add to preload list [`#1118`](https://github.com/Financial-Times/polyfill-library/pull/1118)
- Simply the HTTPS redirection logic in the VCL [`#1116`](https://github.com/Financial-Times/polyfill-library/pull/1116)
- Ie11 mobile matches [`#1071`](https://github.com/Financial-Times/polyfill-library/pull/1071)
- Update Opera configurations for ES6 requirements [`#1100`](https://github.com/Financial-Times/polyfill-library/pull/1100)
- Update iOS Safari browser versions for Symbol based on Kangax ES6 compat table [`#1115`](https://github.com/Financial-Times/polyfill-library/pull/1115)
- update compat data [`#1109`](https://github.com/Financial-Times/polyfill-library/pull/1109)
- Cache results to avoid extraneous fs operations [`#1108`](https://github.com/Financial-Times/polyfill-library/pull/1108)
- Use graceful-fs to handle EMFILE issues automatically (#1106) [`#1107`](https://github.com/Financial-Times/polyfill-library/pull/1107)
- gather rum data when running the test suite [`#1102`](https://github.com/Financial-Times/polyfill-library/pull/1102)
- Fixed Object.getOwnPropertySymbols for Object.prototype [`#1093`](https://github.com/Financial-Times/polyfill-library/pull/1093)
- Run polyfill service in multiple regions and enable automatic failover if a region is unhealthy [`#1098`](https://github.com/Financial-Times/polyfill-library/pull/1098)
- HTTPS where possible [`#1096`](https://github.com/Financial-Times/polyfill-library/pull/1096)
- Use the canonical link [`#1095`](https://github.com/Financial-Times/polyfill-library/pull/1095)
- Update all the dependencies [`#1090`](https://github.com/Financial-Times/polyfill-library/pull/1090)
- Polyfill targeting updates [`#1055`](https://github.com/Financial-Times/polyfill-library/pull/1055)
- Fixes Map in IE [`#1070`](https://github.com/Financial-Times/polyfill-library/pull/1070)
- Add pre-parse for Vivaldi, fixes #735 [`#1050`](https://github.com/Financial-Times/polyfill-library/pull/1050)
- The final line could equally be a comment in the non-minified version [`#1089`](https://github.com/Financial-Times/polyfill-library/pull/1089)
- Remove Docker to simplify and speed up deployments to Heroku [`#1069`](https://github.com/Financial-Times/polyfill-library/pull/1069)
- Separate Promise.prototype.finally from Promise polyfill [`#1063`](https://github.com/Financial-Times/polyfill-library/pull/1063)
- Update polyfills config for Samsung Internet 5 [`#1067`](https://github.com/Financial-Times/polyfill-library/pull/1067)
- Retarget Opera, fixes #860 [`#1061`](https://github.com/Financial-Times/polyfill-library/pull/1061)
- add mutation observer polyfill [`#1056`](https://github.com/Financial-Times/polyfill-library/pull/1056)
- Update sponsor links [`#1060`](https://github.com/Financial-Times/polyfill-library/pull/1060)
- use the new build service domain [`#1059`](https://github.com/Financial-Times/polyfill-library/pull/1059)
- Update IO polyfill, fixes #776 [`#1057`](https://github.com/Financial-Times/polyfill-library/pull/1057)
- Added bb to array includes config [`#1041`](https://github.com/Financial-Times/polyfill-library/pull/1041)
- Update Array.prototype.includes Safari support [`#1038`](https://github.com/Financial-Times/polyfill-library/pull/1038)
- Update useragent module, fixes #749 [`#1049`](https://github.com/Financial-Times/polyfill-library/pull/1049)
- Remove references to non-existent dependency polyfill, fixes #895 [`#1051`](https://github.com/Financial-Times/polyfill-library/pull/1051)
- Extend `Performance.now` polyfill range for Android Browser. [`#1044`](https://github.com/Financial-Times/polyfill-library/pull/1044)
- Fix clean-dist command to remove correct directory [`#1040`](https://github.com/Financial-Times/polyfill-library/pull/1040)
- Enable tests to run on browserstack and saucelabs [`#1046`](https://github.com/Financial-Times/polyfill-library/pull/1046)
- Note that readable streams aren't supported. [`#1039`](https://github.com/Financial-Times/polyfill-library/pull/1039)
- PR for issue  #1036 [`#1037`](https://github.com/Financial-Times/polyfill-library/pull/1037)
- Bugfix: Element.prototype.placeholder not working on textarea [`#1022`](https://github.com/Financial-Times/polyfill-library/pull/1022)
- Fix contribution terms link, fixes #1014 [`#1032`](https://github.com/Financial-Times/polyfill-library/pull/1032)
- Adding feature filter [`#1007`](https://github.com/Financial-Times/polyfill-library/pull/1007)
- Purge assets for website on deployment [`#1031`](https://github.com/Financial-Times/polyfill-library/pull/1031)
- Serve intl to browsers who identify as chrome &lt;= version 34 [`#1028`](https://github.com/Financial-Times/polyfill-library/pull/1028)
- Add bespoke detects for each Intl locale [`#1027`](https://github.com/Financial-Times/polyfill-library/pull/1027)
- update yaku to include the finally method :tada: [`#1017`](https://github.com/Financial-Times/polyfill-library/pull/1017)
- README.md: fix typo: 'rebuiling' -&gt; 'rebuilding' [`#1030`](https://github.com/Financial-Times/polyfill-library/pull/1030)
- Prevent output of RUM when `rum=0` is included in ?qs [`#1021`](https://github.com/Financial-Times/polyfill-library/pull/1021)
- Add polyfill for Number.parseFloat and Number.parseInt. [`#1012`](https://github.com/Financial-Times/polyfill-library/pull/1012)
- Add Object.entries polyfill [`#976`](https://github.com/Financial-Times/polyfill-library/pull/976)
- Enable `Function.name` via es6 alias [`#1013`](https://github.com/Financial-Times/polyfill-library/pull/1013)
- removing files created at build time and tidying up ignores [`#1009`](https://github.com/Financial-Times/polyfill-library/pull/1009)
- update the shrinkwrap now that we removed many modules [`#1016`](https://github.com/Financial-Times/polyfill-library/pull/1016)
- add ipv6 tracking [`#1011`](https://github.com/Financial-Times/polyfill-library/pull/1011)
- Add logging from fastly [`#1010`](https://github.com/Financial-Times/polyfill-library/pull/1010)
- Normalise purge [`#1008`](https://github.com/Financial-Times/polyfill-library/pull/1008)
- A bit less grunt [`#1000`](https://github.com/Financial-Times/polyfill-library/pull/1000)
- Use a feature which is not in the default set [`#1005`](https://github.com/Financial-Times/polyfill-library/pull/1005)
- Rum report [`#999`](https://github.com/Financial-Times/polyfill-library/pull/999)
- Fix document.currentScript [`#975`](https://github.com/Financial-Times/polyfill-library/pull/975)
- onhashchange is undefined when not configured, even when supported by the browser [`#947`](https://github.com/Financial-Times/polyfill-library/pull/947)
- Improve UI JS, fixes #966 [`#998`](https://github.com/Financial-Times/polyfill-library/pull/998)
- Enable `performance.now` and `Array.from` for Opera Mini [`#1004`](https://github.com/Financial-Times/polyfill-library/pull/1004)
- remove minimist [`#1003`](https://github.com/Financial-Times/polyfill-library/pull/1003)
- update shrinkwrap [`#1001`](https://github.com/Financial-Times/polyfill-library/pull/1001)
- Add deprecation note to String.prototype.contains as for Array.prototype.contains. [`#965`](https://github.com/Financial-Times/polyfill-library/pull/965)
- Make IE/Edge nomenclature clearer [`#997`](https://github.com/Financial-Times/polyfill-library/pull/997)
- Adding dataset polyfill [`#983`](https://github.com/Financial-Times/polyfill-library/pull/983)
- Nicer sauce [`#992`](https://github.com/Financial-Times/polyfill-library/pull/992)
- Add HTMLCanvasElement.protoype.toBlob polyfill [`#921`](https://github.com/Financial-Times/polyfill-library/pull/921)
- Update min mobile safari version for Math.trunc [`#988`](https://github.com/Financial-Times/polyfill-library/pull/988)
- Swap out custom stream lib for external libs [`#987`](https://github.com/Financial-Times/polyfill-library/pull/987)
- Workflow files for issue template and contribution guide [`#989`](https://github.com/Financial-Times/polyfill-library/pull/989)
- Firefox shipped IO in 52 [`#972`](https://github.com/Financial-Times/polyfill-library/pull/972)
- fix `CDN` link in README [`#984`](https://github.com/Financial-Times/polyfill-library/pull/984)
- Add Event and performance.now as deps to intersectionobserver [`#964`](https://github.com/Financial-Times/polyfill-library/pull/964)
- Update test browsers [`#954`](https://github.com/Financial-Times/polyfill-library/pull/954)
- Add `Number.isInteger` polyfill [`#977`](https://github.com/Financial-Times/polyfill-library/pull/977)
- Update intl and drop support for IE 7&8 [`#913`](https://github.com/Financial-Times/polyfill-library/pull/913)
- Add polyfill for HTML5's `document.currentScript` [`#973`](https://github.com/Financial-Times/polyfill-library/pull/973)
- Add support for Android for requestAnimationFrame [`#944`](https://github.com/Financial-Times/polyfill-library/pull/944)
- Doesn't throw in ES6 context, instead returns undefined [`#971`](https://github.com/Financial-Times/polyfill-library/pull/971)
- Update error messages for Object.defineProperty [`#970`](https://github.com/Financial-Times/polyfill-library/pull/970)
- Completed iterators don't always contain a value property [`#969`](https://github.com/Financial-Times/polyfill-library/pull/969)
- Pass in parameters as empty asserts throw exceptions [`#968`](https://github.com/Financial-Times/polyfill-library/pull/968)
- Update config.json of HTMLPictureElement [`#930`](https://github.com/Financial-Times/polyfill-library/pull/930)
- Remove detect from fetch polyfill [`#948`](https://github.com/Financial-Times/polyfill-library/pull/948)
- Fix semver for IE/Edge for NodeList.prototype.@@iterator [`#962`](https://github.com/Financial-Times/polyfill-library/pull/962)
- Switch from JSHint to ESLint for website JS [`#938`](https://github.com/Financial-Times/polyfill-library/pull/938)
- Grunt build (fixes #955) [`#956`](https://github.com/Financial-Times/polyfill-library/pull/956)
- Fix Set iteration bug #949 [`#950`](https://github.com/Financial-Times/polyfill-library/pull/950)
- Add polyfill for pre-ES6 form of `Function.name` [`#951`](https://github.com/Financial-Times/polyfill-library/pull/951)
- polyfill URL for all IEs and Edge browsers [`#946`](https://github.com/Financial-Times/polyfill-library/pull/946)
- Stream output [`#903`](https://github.com/Financial-Times/polyfill-library/pull/903)
- Redirect qa to https [`#942`](https://github.com/Financial-Times/polyfill-library/pull/942)
- Update config.json of Number.isNaN [`#929`](https://github.com/Financial-Times/polyfill-library/pull/929)
- _mutation [`#940`](https://github.com/Financial-Times/polyfill-library/pull/940)
- Fix typo in url [`#939`](https://github.com/Financial-Times/polyfill-library/pull/939)
- Polyfill console.info and console.error for IE Mobile &lt;= 9 [`#914`](https://github.com/Financial-Times/polyfill-library/pull/914)
- Fix semver syntax bug, closes #931 [`#932`](https://github.com/Financial-Times/polyfill-library/pull/932)
- Fix syntax error [`#935`](https://github.com/Financial-Times/polyfill-library/pull/935)
- Don't overwrite console object if it exists. [`#926`](https://github.com/Financial-Times/polyfill-library/pull/926)
- Switch edge 12 for edge 14 [`#936`](https://github.com/Financial-Times/polyfill-library/pull/936)
- Add examples for feature detection and async loading [`#925`](https://github.com/Financial-Times/polyfill-library/pull/925)
- Merge DOMContentLoaded in Event Polyfill [`#862`](https://github.com/Financial-Times/polyfill-library/pull/862)
- polyfill symbol in BlackBerry [`#918`](https://github.com/Financial-Times/polyfill-library/pull/918)
- Run linter on CI [`#919`](https://github.com/Financial-Times/polyfill-library/pull/919)
- Update sources.js [`#917`](https://github.com/Financial-Times/polyfill-library/pull/917)
- Map/Set IteratorResults now always have a value [`#901`](https://github.com/Financial-Times/polyfill-library/pull/901)
- Update jsdoc with correct params and return types [`#909`](https://github.com/Financial-Times/polyfill-library/pull/909)
- Simplify require call for appVersion [`#908`](https://github.com/Financial-Times/polyfill-library/pull/908)
- Change detect to use `this` instead of `window` [`#907`](https://github.com/Financial-Times/polyfill-library/pull/907)
- Add missing Document dependency for html5shiv [`#906`](https://github.com/Financial-Times/polyfill-library/pull/906)
- Fix: Safari 10 now supports Intl [`#904`](https://github.com/Financial-Times/polyfill-library/pull/904)
- Compat update from RUM data [`#902`](https://github.com/Financial-Times/polyfill-library/pull/902)
- Update config.json [`#899`](https://github.com/Financial-Times/polyfill-library/pull/899)
- values property should not be enumerable, fixes #880 [`#894`](https://github.com/Financial-Times/polyfill-library/pull/894)
- Fix the validation order [`#872`](https://github.com/Financial-Times/polyfill-library/pull/872)
- Adjust Symbol config for Opera browser [`#889`](https://github.com/Financial-Times/polyfill-library/pull/889)
- Update config.json for Element [`#867`](https://github.com/Financial-Times/polyfill-library/pull/867)
- Reinstate RUM improvements with fix for gated flag [`#890`](https://github.com/Financial-Times/polyfill-library/pull/890)
- Fix compat RUM data (comes in as a string, so '0' is true!) [`#891`](https://github.com/Financial-Times/polyfill-library/pull/891)
- Add MIN_SAFE_INTEGER [`#886`](https://github.com/Financial-Times/polyfill-library/pull/886)
- Add MAX_SAFE_INTEGER [`#885`](https://github.com/Financial-Times/polyfill-library/pull/885)
- Fixes #887 [`#888`](https://github.com/Financial-Times/polyfill-library/pull/888)
- Remove Object.defineProperty dependency [`#874`](https://github.com/Financial-Times/polyfill-library/pull/874)
- Serve ArrayIterator polyfill to Samsung Browser [`#877`](https://github.com/Financial-Times/polyfill-library/pull/877)
- change ie browser version for Symbol polyfills [`#882`](https://github.com/Financial-Times/polyfill-library/pull/882)
- Missing a space in an exception message. [`#883`](https://github.com/Financial-Times/polyfill-library/pull/883)
- use json polyfill via third party install method [`#831`](https://github.com/Financial-Times/polyfill-library/pull/831)
- Add UC Browser - mimic IE [`#853`](https://github.com/Financial-Times/polyfill-library/pull/853)
- Revert "Rum improvements (#859)" [`#878`](https://github.com/Financial-Times/polyfill-library/pull/878)
- Add detect for incomplete Safari 8 implementation [`#870`](https://github.com/Financial-Times/polyfill-library/pull/870)
- All EDGE 14 builds do not support fetch [`#865`](https://github.com/Financial-Times/polyfill-library/pull/865)
- Update config.json for Symbol [`#868`](https://github.com/Financial-Times/polyfill-library/pull/868)
- Update release-process documentation [`#866`](https://github.com/Financial-Times/polyfill-library/pull/866)
- Change from ESI to cookie for data centre detection [`#864`](https://github.com/Financial-Times/polyfill-library/pull/864)
- Rum improvements [`#859`](https://github.com/Financial-Times/polyfill-library/pull/859)
- Lambda task for RUM processing [`#851`](https://github.com/Financial-Times/polyfill-library/pull/851)
- widen browser delivery of iterators [`#848`](https://github.com/Financial-Times/polyfill-library/pull/848)
- Add linting to first-party polyfills [`#809`](https://github.com/Financial-Times/polyfill-library/pull/809)
- Update to latest version of URL, use new install mechanism [`#800`](https://github.com/Financial-Times/polyfill-library/pull/800)
- Add es6 alias to es6 features [`#847`](https://github.com/Financial-Times/polyfill-library/pull/847)
- Add missing dev-dependency node-fetch [`#839`](https://github.com/Financial-Times/polyfill-library/pull/839)
- Fix browser support configurations of Map/Set/WeakMap/WeakSet [`#818`](https://github.com/Financial-Times/polyfill-library/pull/818)
- Fix browser support configurations of Array [`#825`](https://github.com/Financial-Times/polyfill-library/pull/825)
- correct spelling of agreement [`#837`](https://github.com/Financial-Times/polyfill-library/pull/837)
- Number.isFinite(...) [`#834`](https://github.com/Financial-Times/polyfill-library/pull/834)
- Add a script to purge assets from the CDN, run this script after each deploy [`#836`](https://github.com/Financial-Times/polyfill-library/pull/836)
- Update dependencies and shrinkwrap [`#832`](https://github.com/Financial-Times/polyfill-library/pull/832)
- install UserTiming polyfill via third-party mechanism [`#830`](https://github.com/Financial-Times/polyfill-library/pull/830)
- Fix closing code tags in docs/contributing/common-scenarios.html [`#828`](https://github.com/Financial-Times/polyfill-library/pull/828)
- Sourcemaps issue [`#821`](https://github.com/Financial-Times/polyfill-library/pull/821)
- Add array.of via new third party install method [`#805`](https://github.com/Financial-Times/polyfill-library/pull/805)
- Set browser to Unknown if below baseline version [`#819`](https://github.com/Financial-Times/polyfill-library/pull/819)
- Set browser to Unknown if below baseline version [`#819`](https://github.com/Financial-Times/polyfill-library/pull/819)
- Revert "Revert "Need to set Picture polyfill IE to 7+ to support Methode"" [`#804`](https://github.com/Financial-Times/polyfill-library/pull/804)
- Add atob btoa via new third party install method [`#806`](https://github.com/Financial-Times/polyfill-library/pull/806)
- Switch from expect.js to Proclaim [`#813`](https://github.com/Financial-Times/polyfill-library/pull/813)
- Remove a not own property constraint for iterators in Array.from [`#817`](https://github.com/Financial-Times/polyfill-library/pull/817)
- Add html5shiv via new third party install method [`#807`](https://github.com/Financial-Times/polyfill-library/pull/807)
- Add AudioContext via new third party install method [`#808`](https://github.com/Financial-Times/polyfill-library/pull/808)
- Update Element.prototype.after et al. config [`#815`](https://github.com/Financial-Times/polyfill-library/pull/815)
- chore(package): update dependencies [`#814`](https://github.com/Financial-Times/polyfill-library/pull/814)
- Update dependencies [`#811`](https://github.com/Financial-Times/polyfill-library/pull/811)
- Sort querystring using boltsort for better caching [`#812`](https://github.com/Financial-Times/polyfill-library/pull/812)
- samsing -&gt; samsung [`#802`](https://github.com/Financial-Times/polyfill-library/pull/802)
- Update docs with better walkthroughs [`#801`](https://github.com/Financial-Times/polyfill-library/pull/801)
- Add tests for fb ios app useragent [`#791`](https://github.com/Financial-Times/polyfill-library/pull/791)
- Rhys/dom iterators [`#798`](https://github.com/Financial-Times/polyfill-library/pull/798)
- Fix Math.clz32 [`#786`](https://github.com/Financial-Times/polyfill-library/pull/786)
- Move RUM logging to CDN [`#790`](https://github.com/Financial-Times/polyfill-library/pull/790)
- update deployment documentation [`#789`](https://github.com/Financial-Times/polyfill-library/pull/789)
- Samsung browser support [`#787`](https://github.com/Financial-Times/polyfill-library/pull/787)
- Identify the polyfills needed for Samsung Internet 4 [`#783`](https://github.com/Financial-Times/polyfill-library/pull/783)
- Rhys/array iterators [`#726`](https://github.com/Financial-Times/polyfill-library/pull/726)
- Add writeable property descriptors returned by Object.getOwnPropertyDescriptor polyfill [`#784`](https://github.com/Financial-Times/polyfill-library/pull/784)
- Pass string to factory to avoid throwing errors in modern browsers [`#773`](https://github.com/Financial-Times/polyfill-library/pull/773)
- Build polyfills inside Docker image instead of copying from the host. [`#770`](https://github.com/Financial-Times/polyfill-library/pull/770)
- Failing Array.from test (IE) [`#766`](https://github.com/Financial-Times/polyfill-library/pull/766)
- Promises: Switch from Octane to Yaku [`#780`](https://github.com/Financial-Times/polyfill-library/pull/780)
- Use relative path to fix clean task [`#781`](https://github.com/Financial-Times/polyfill-library/pull/781)
- Add aliasing for FB in-app browser on iOS, fixes #561 [`#775`](https://github.com/Financial-Times/polyfill-library/pull/775)
- Minified reserved words [`#779`](https://github.com/Financial-Times/polyfill-library/pull/779)
- update intl to latest version [`#698`](https://github.com/Financial-Times/polyfill-library/pull/698)
- Enable Object.create(Function.prototype) to work [`#777`](https://github.com/Financial-Times/polyfill-library/pull/777)
- Simplify installing third-party polyfills from NPM [`#762`](https://github.com/Financial-Times/polyfill-library/pull/762)
- Add browsers to IntersectionObserver config [`#769`](https://github.com/Financial-Times/polyfill-library/pull/769)
- Added callback type check in addEventListener to avoid exceptions [`#767`](https://github.com/Financial-Times/polyfill-library/pull/767)
- Symbol polyfill: Resolve cross-domain issue on IE11 [`#760`](https://github.com/Financial-Times/polyfill-library/pull/760)
- protocol agnostic rum collection [`#759`](https://github.com/Financial-Times/polyfill-library/pull/759)
- Enable Symbols to be added to NodeList in IE11 [`#757`](https://github.com/Financial-Times/polyfill-library/pull/757)
- Add "android" browser to Intl locales [`#754`](https://github.com/Financial-Times/polyfill-library/pull/754)
- Add IE mobile to Symbol.* polyfills [`#756`](https://github.com/Financial-Times/polyfill-library/pull/756)
- IntersectionObserver shipped in Chrome 51 [`#755`](https://github.com/Financial-Times/polyfill-library/pull/755)
- Real user monitoring [`#743`](https://github.com/Financial-Times/polyfill-library/pull/743)
- Switch calls from buildsources to build [`#742`](https://github.com/Financial-Times/polyfill-library/pull/742)
- Revert "Add commonJS support for external modules (#719)" [`#744`](https://github.com/Financial-Times/polyfill-library/pull/744)
- IntersectionObserver shipped in Chrome 51 [`#741`](https://github.com/Financial-Times/polyfill-library/pull/741)
- Change version shown in link text in Contrib docs. [`#740`](https://github.com/Financial-Times/polyfill-library/pull/740)
- Update Promise/Symbol/fetch polyfills for Edge [`#737`](https://github.com/Financial-Times/polyfill-library/pull/737)
- IntersectionObserver [`#684`](https://github.com/Financial-Times/polyfill-library/pull/684)
- Routes [`#738`](https://github.com/Financial-Times/polyfill-library/pull/738)
- Update fetch, closes #724, closes #710 [`#728`](https://github.com/Financial-Times/polyfill-library/pull/728)
- Redirect to https if the host is the default [`#730`](https://github.com/Financial-Times/polyfill-library/pull/730)
- Provide immutable default sets [`#725`](https://github.com/Financial-Times/polyfill-library/pull/725)
- add fastly purge auth to vcl file [`#729`](https://github.com/Financial-Times/polyfill-library/pull/729)
- Reinstate the existing Event prototype, fixes #705 [`#713`](https://github.com/Financial-Times/polyfill-library/pull/713)
- assign append to the correct method name for Document [`#721`](https://github.com/Financial-Times/polyfill-library/pull/721)
- Add commonJS support for external modules [`#719`](https://github.com/Financial-Times/polyfill-library/pull/719)
- syntax error, fixes #709 [`#711`](https://github.com/Financial-Times/polyfill-library/pull/711)
- Possible docker deployment approach [`#658`](https://github.com/Financial-Times/polyfill-library/pull/658)
- Fixed Object.create polyfill issue when called through Babel's Object's create wrapper [`#708`](https://github.com/Financial-Times/polyfill-library/pull/708)
- Implement Set polyfill, closes #680 [`#694`](https://github.com/Financial-Times/polyfill-library/pull/694)
- Use a private DOMTokenList implementation for classList polyfill since we need an accessible constructor [`#693`](https://github.com/Financial-Times/polyfill-library/pull/693)
- Add navigator.sendBeacon, closes #539 [`#689`](https://github.com/Financial-Times/polyfill-library/pull/689)
- Force TLS, and update VCL on deploy, closes #677 [`#682`](https://github.com/Financial-Times/polyfill-library/pull/682)
- Raise baseline to exclude IE6, Safari 3, Android 2. [`#687`](https://github.com/Financial-Times/polyfill-library/pull/687)
- Add getElementsByClassName, closes #169 [`#688`](https://github.com/Financial-Times/polyfill-library/pull/688)
- Use Node 6 to handle HTTP clientError scenarios correctly, fixes #567 [`#686`](https://github.com/Financial-Times/polyfill-library/pull/686)
- Daily stats [`#685`](https://github.com/Financial-Times/polyfill-library/pull/685)
- Exclude option, closes #435 [`#683`](https://github.com/Financial-Times/polyfill-library/pull/683)
- Add warning note for accessor props on IE8 [`#681`](https://github.com/Financial-Times/polyfill-library/pull/681)
- Add Map polyfill [`#670`](https://github.com/Financial-Times/polyfill-library/pull/670)
- Change build URLs [`#674`](https://github.com/Financial-Times/polyfill-library/pull/674)
- Add hsts header [`#673`](https://github.com/Financial-Times/polyfill-library/pull/673)
- Add Promise to  es6 set [`#672`](https://github.com/Financial-Times/polyfill-library/pull/672)
- Add deployment notes and rewrite readme [`#669`](https://github.com/Financial-Times/polyfill-library/pull/669)
- Symbol polyfill [`#585`](https://github.com/Financial-Times/polyfill-library/pull/585)
- add o-techdocs-container for o-techdocs 5 migration [`#668`](https://github.com/Financial-Times/polyfill-library/pull/668)
- Add more polyfills to the default set, see #655 [`#660`](https://github.com/Financial-Times/polyfill-library/pull/660)
- Show console warning when using the 'all' alias [`#659`](https://github.com/Financial-Times/polyfill-library/pull/659)
- Add acid test mode to features page, closes #611 [`#641`](https://github.com/Financial-Times/polyfill-library/pull/641)
- Pagevisibility rename [`#661`](https://github.com/Financial-Times/polyfill-library/pull/661)
- Skip tests that fail against native impl in FF, fixes #640 [`#656`](https://github.com/Financial-Times/polyfill-library/pull/656)
- Updated browser support - Fixes #642 [`#657`](https://github.com/Financial-Times/polyfill-library/pull/657)
- Add Array.prototype.fill polyfill [`#601`](https://github.com/Financial-Times/polyfill-library/pull/601)
- Issue 610 - Fixing Windows build [`#651`](https://github.com/Financial-Times/polyfill-library/pull/651)
- Update syntax to ES6 [`#643`](https://github.com/Financial-Times/polyfill-library/pull/643)
- Make classlist polyfill configurable [`#648`](https://github.com/Financial-Times/polyfill-library/pull/648)
- Add Circle CI [`#647`](https://github.com/Financial-Times/polyfill-library/pull/647)
- pass absolute path to grunt-clean [`#639`](https://github.com/Financial-Times/polyfill-library/pull/639)
- Improve docs [`#620`](https://github.com/Financial-Times/polyfill-library/pull/620)
- NaN (closes #608) [`#637`](https://github.com/Financial-Times/polyfill-library/pull/637)
- fix config for URL [`#630`](https://github.com/Financial-Times/polyfill-library/pull/630)
- Update files from build service to use the v2 endpoint [`#626`](https://github.com/Financial-Times/polyfill-library/pull/626)
- return Boolean from URL detect [`#629`](https://github.com/Financial-Times/polyfill-library/pull/629)
- Intl update [`#624`](https://github.com/Financial-Times/polyfill-library/pull/624)
- HTMLPictureElement polyfill in IE8 [`#534`](https://github.com/Financial-Times/polyfill-library/pull/534)
- updated semver ranges for safari mobile array properties [`#612`](https://github.com/Financial-Times/polyfill-library/pull/612)
- Update browser compatibility for Array.from [`#622`](https://github.com/Financial-Times/polyfill-library/pull/622)
- Validate dependency graph as part of build process [`#619`](https://github.com/Financial-Times/polyfill-library/pull/619)
- Add individual console methods [`#570`](https://github.com/Financial-Times/polyfill-library/pull/570)
- Suppress unused deps [`#618`](https://github.com/Financial-Times/polyfill-library/pull/618)
- fix: Need Intl polypill for native android browser [`#613`](https://github.com/Financial-Times/polyfill-library/pull/613)
- Restrict setImmediate config [`#588`](https://github.com/Financial-Times/polyfill-library/pull/588)
- Strip Firefox from iOS UAs [`#617`](https://github.com/Financial-Times/polyfill-library/pull/617)
- Polyfill fetch for BlackBerry [`#602`](https://github.com/Financial-Times/polyfill-library/pull/602)
- node version - add minimal version in package.json [`#609`](https://github.com/Financial-Times/polyfill-library/pull/609)
- Return before trying to cast property to string [`#592`](https://github.com/Financial-Times/polyfill-library/pull/592)
- Fix typos [`#598`](https://github.com/Financial-Times/polyfill-library/pull/598)
- Added blissfuljs alias, as discussed in #594 [`#596`](https://github.com/Financial-Times/polyfill-library/pull/596)
- UserTiming polyfill [`#586`](https://github.com/Financial-Times/polyfill-library/pull/586)
- Element.prototype.placeholder not displaying - fixes #566 [`#584`](https://github.com/Financial-Times/polyfill-library/pull/584)
- Add picturefill on android [`#574`](https://github.com/Financial-Times/polyfill-library/pull/574)
- Deliver findIndex to Blackberry devices [`#583`](https://github.com/Financial-Times/polyfill-library/pull/583)
- grunt task buildsources -  fix for missing subdirectories [`#565`](https://github.com/Financial-Times/polyfill-library/pull/565)
- Classify all unsupported browser families as unknown, express debug more clearly, fixes #572 [`#573`](https://github.com/Financial-Times/polyfill-library/pull/573)
- Add edge mobile [`#571`](https://github.com/Financial-Times/polyfill-library/pull/571)
- Closes #557  [`#569`](https://github.com/Financial-Times/polyfill-library/pull/569)
- Fix old markdown link [`#562`](https://github.com/Financial-Times/polyfill-library/pull/562)
- Corrected indexOf casing in matchMedia polyfill [`#515`](https://github.com/Financial-Times/polyfill-library/pull/515)
- Remove support for v1 API [`#560`](https://github.com/Financial-Times/polyfill-library/pull/560)
- Enable `localStorage` polyfill in Opera Mini [`#503`](https://github.com/Financial-Times/polyfill-library/pull/503)
- No variants [`#559`](https://github.com/Financial-Times/polyfill-library/pull/559)
- Array.prototype.includes updated browser support for firefox 43 [`#549`](https://github.com/Financial-Times/polyfill-library/pull/549)
- String.prototype.startsWith updated browser support for chrome 41 [`#550`](https://github.com/Financial-Times/polyfill-library/pull/550)
- String.prototype.includes browser support for chrome 41 and firefox 40 [`#551`](https://github.com/Financial-Times/polyfill-library/pull/551)
- Array.prototype.find updated browser support for chrome 45 [`#552`](https://github.com/Financial-Times/polyfill-library/pull/552)
- Array.prototype.findIndex updated browser support for chrome 45 [`#553`](https://github.com/Financial-Times/polyfill-library/pull/553)
- Array.from updated browser support for firefox 32 [`#554`](https://github.com/Financial-Times/polyfill-library/pull/554)
- Array.of updated browser support for chrome 45 [`#555`](https://github.com/Financial-Times/polyfill-library/pull/555)
- polyfilling page visibility api [`#536`](https://github.com/Financial-Times/polyfill-library/pull/536)
- HTMLPictureElement for BB7-10 [`#548`](https://github.com/Financial-Times/polyfill-library/pull/548)
- RequestAnimationFrame webkit polyfill ios_saf 6 [`#543`](https://github.com/Financial-Times/polyfill-library/pull/543)
- Give Array.prototype.find to BB devices [`#544`](https://github.com/Financial-Times/polyfill-library/pull/544)
- Event/polyfill-ie8.js certain event listeners on window in IE8 never fire (local for #463) [`#475`](https://github.com/Financial-Times/polyfill-library/pull/475)
- Update picturefill [`#533`](https://github.com/Financial-Times/polyfill-library/pull/533)
- Add to whatever Vary header has been set already, rather than overwrite [`#541`](https://github.com/Financial-Times/polyfill-library/pull/541)
- Add simple memory cache around the latest polyfill collection [`#529`](https://github.com/Financial-Times/polyfill-library/pull/529)
- Add android native browser for fetch polyfill (local for #508) [`#513`](https://github.com/Financial-Times/polyfill-library/pull/513)
- Make window.hasOwnProperty work in IE8 (local for #486) [`#512`](https://github.com/Financial-Times/polyfill-library/pull/512)
- Update versions from String.prototype.repeat [`#510`](https://github.com/Financial-Times/polyfill-library/pull/510)
- Tp/paramsbug [`#506`](https://github.com/Financial-Times/polyfill-library/pull/506)
- Add blocked event loop metrics [`#507`](https://github.com/Financial-Times/polyfill-library/pull/507)
- Update HTML5 Shiv to latest version (3.7.3) [`#489`](https://github.com/Financial-Times/polyfill-library/pull/489)
- fix: Function.prototype.bind was failing on new BoundFn() (local for #483) [`#485`](https://github.com/Financial-Times/polyfill-library/pull/485)
- Support Firefox for Android [`#481`](https://github.com/Financial-Times/polyfill-library/pull/481)
- IE11 doesn't support Event constructor - adding to required browsers [`#482`](https://github.com/Financial-Times/polyfill-library/pull/482)
- Configure IE polyfills to match IE Mobile [`#474`](https://github.com/Financial-Times/polyfill-library/pull/474)
- Change license for rAF polyfill to MIT [`#476`](https://github.com/Financial-Times/polyfill-library/pull/476)
- Local UA cache [`#465`](https://github.com/Financial-Times/polyfill-library/pull/465)
- update deploy to haikro 2 api [`#471`](https://github.com/Financial-Times/polyfill-library/pull/471)
- Async refactor for individual source caching [`#472`](https://github.com/Financial-Times/polyfill-library/pull/472)
- Include the PID, if available, in the metric key [`#464`](https://github.com/Financial-Times/polyfill-library/pull/464)
- Reorg into folders [`#462`](https://github.com/Financial-Times/polyfill-library/pull/462)
- Picturefill (local for #437) [`#448`](https://github.com/Financial-Times/polyfill-library/pull/448)
- polyfill Promise also for mobile IE11 [`#459`](https://github.com/Financial-Times/polyfill-library/pull/459)
- Changes to docs and testing for subfolder structure, fixes #438, fixes #454 [`#458`](https://github.com/Financial-Times/polyfill-library/pull/458)
- Add missing mobile browsers [`#457`](https://github.com/Financial-Times/polyfill-library/pull/457)
- Object get own property names patch [`#439`](https://github.com/Financial-Times/polyfill-library/pull/439)
- polyfill querySelector in ie8 [`#445`](https://github.com/Financial-Times/polyfill-library/pull/445)
- Provide bin entry, bin for global installation and CLI usage (see #442) [`#446`](https://github.com/Financial-Times/polyfill-library/pull/446)
- CI opt out to speed up CI on Intl [`#447`](https://github.com/Financial-Times/polyfill-library/pull/447)
- Fix npm licence SPDX conformity warning by using the CC0-1.0 identifier [`#441`](https://github.com/Financial-Times/polyfill-library/pull/441)
- Change TTL for polyfills to 1 week [`#434`](https://github.com/Financial-Times/polyfill-library/pull/434)
- Cache node_modules on travis [`#428`](https://github.com/Financial-Times/polyfill-library/pull/428)
- Switch from .semver to package.json version [`#431`](https://github.com/Financial-Times/polyfill-library/pull/431)
- Add shrinkwrap file [`#425`](https://github.com/Financial-Times/polyfill-library/pull/425)
- Switch the range for _enqueueMicrotask back to IE 9 and above [`#426`](https://github.com/Financial-Times/polyfill-library/pull/426)
- adds grunt task to general intl polyfill structure [`#419`](https://github.com/Financial-Times/polyfill-library/pull/419)
- Element.prototype.classlist for svg elements [`#423`](https://github.com/Financial-Times/polyfill-library/pull/423)
- Adds test to Object.create for API objects as it fails in IE8 [`#381`](https://github.com/Financial-Times/polyfill-library/pull/381)
- Strip any mention of the CriOS version from the user agent string [`#416`](https://github.com/Financial-Times/polyfill-library/pull/416)
- Do not polyfill fetch for supporting browsers [`#415`](https://github.com/Financial-Times/polyfill-library/pull/415)
- Fix String.prototype.endsWith when more than one match is found [`#413`](https://github.com/Financial-Times/polyfill-library/pull/413)
- polyfilling screen.orientation in webkit [`#403`](https://github.com/Financial-Times/polyfill-library/pull/403)
- add test and fix matchMedia operator "only" [`#407`](https://github.com/Financial-Times/polyfill-library/pull/407)
- Object.assign avoid arguments object deopt [`#396`](https://github.com/Financial-Times/polyfill-library/pull/396)
- Failing match media test [`#393`](https://github.com/Financial-Times/polyfill-library/pull/393)
- Updated config for String.prototype.includes to match all Firefox versions [`#385`](https://github.com/Financial-Times/polyfill-library/pull/385)
- Use o-header img [`#389`](https://github.com/Financial-Times/polyfill-library/pull/389)
- Revert my previous comit [`#380`](https://github.com/Financial-Times/polyfill-library/pull/380)
- Saucelabs task refactor [`#379`](https://github.com/Financial-Times/polyfill-library/pull/379)
- Standardise detects, closes #332 [`#372`](https://github.com/Financial-Times/polyfill-library/pull/372)
- Remove license metadata for fetch polyfill [`#376`](https://github.com/Financial-Times/polyfill-library/pull/376)
- Update browser spec for Array.prototype.findIndex [`#368`](https://github.com/Financial-Times/polyfill-library/pull/368)
- Remove redundant techdocs class [`#343`](https://github.com/Financial-Times/polyfill-library/pull/343)
- Remove prettyprint since o-techdocs includes highlightjs [`#344`](https://github.com/Financial-Times/polyfill-library/pull/344)
- fix polyfill String.prototype.endsWith [`#349`](https://github.com/Financial-Times/polyfill-library/pull/349)
- String.prototype.endsWith chrome [`#350`](https://github.com/Financial-Times/polyfill-library/pull/350)
- Contrib terms per hangout with @jonathantneal, closes #327 [`#338`](https://github.com/Financial-Times/polyfill-library/pull/338)
- _enqueueMicrotask should target all browser versions [`#351`](https://github.com/Financial-Times/polyfill-library/pull/351)
- Add note about EventTarget methods [`#362`](https://github.com/Financial-Times/polyfill-library/pull/362)
- Include dependencies for the variants [`#348`](https://github.com/Financial-Times/polyfill-library/pull/348)
- Add (most) missing docs links [`#354`](https://github.com/Financial-Times/polyfill-library/pull/354)
- Load webfonts [`#342`](https://github.com/Financial-Times/polyfill-library/pull/342)
- devicePixelRatio broken in IE8 [`#333`](https://github.com/Financial-Times/polyfill-library/pull/333)
- Use es5-shim version of Function.prototype.bind [`#336`](https://github.com/Financial-Times/polyfill-library/pull/336)
- Extend config for repo, docs, spec, remove author [`#337`](https://github.com/Financial-Times/polyfill-library/pull/337)
- #319 [`#322`](https://github.com/Financial-Times/polyfill-library/pull/322)
- Update Function.prototype.bind [`#329`](https://github.com/Financial-Times/polyfill-library/pull/329)
- Window.location.origin [`#324`](https://github.com/Financial-Times/polyfill-library/pull/324)
- Fix installing collections [`#318`](https://github.com/Financial-Times/polyfill-library/pull/318)
- Error handling for Object.defineProperty [`#263`](https://github.com/Financial-Times/polyfill-library/pull/263)
- Fix Promise.all, fixes #307 [`#315`](https://github.com/Financial-Times/polyfill-library/pull/315)
- Fix targeting of Array.prototype.find, fixes #308 [`#314`](https://github.com/Financial-Times/polyfill-library/pull/314)
- Fix typo in polyfills/Events/tests.js [`#311`](https://github.com/Financial-Times/polyfill-library/pull/311)
- delete element._events[type] when last listener is removed. Fixes #302 [`#306`](https://github.com/Financial-Times/polyfill-library/pull/306)
- Adds Modernizr matchMedia alias [`#304`](https://github.com/Financial-Times/polyfill-library/pull/304)
- Url polyfill [`#298`](https://github.com/Financial-Times/polyfill-library/pull/298)
- Set separate jshint standards for the node app and the polyfills library [`#279`](https://github.com/Financial-Times/polyfill-library/pull/279)
- Use graphite for metrics (+better env var docs to support that) [`#293`](https://github.com/Financial-Times/polyfill-library/pull/293)
- Separate Element mutations methods [`#288`](https://github.com/Financial-Times/polyfill-library/pull/288)
- Add enqueueMicrotask [`#287`](https://github.com/Financial-Times/polyfill-library/pull/287)
- Fix matchMedia queries with multiple dimensions [`#289`](https://github.com/Financial-Times/polyfill-library/pull/289)
- Array contains -&gt; includes, fix bug, closes #294 [`#295`](https://github.com/Financial-Times/polyfill-library/pull/295)
- Allow resource timing [`#292`](https://github.com/Financial-Times/polyfill-library/pull/292)
- Fix matchMedia queries with landscape [`#290`](https://github.com/Financial-Times/polyfill-library/pull/290)
- Update replace method as replaceWith [`#254`](https://github.com/Financial-Times/polyfill-library/pull/254)
- Support 'unknown' param, closes #252.  Tidy and reorg service/lib interface [`#276`](https://github.com/Financial-Times/polyfill-library/pull/276)
- Add 'all' alias mapping to entire feature set, closes #258 [`#275`](https://github.com/Financial-Times/polyfill-library/pull/275)
- Move source compilation to a build step, closes #233 [`#269`](https://github.com/Financial-Times/polyfill-library/pull/269)
- Polyfill fetch API, closes #109 [`#246`](https://github.com/Financial-Times/polyfill-library/pull/246)
- New promise polyfill [`#257`](https://github.com/Financial-Times/polyfill-library/pull/257)
- Fix API docs [`#262`](https://github.com/Financial-Times/polyfill-library/pull/262)
- Build Service relies on CustomEvent, which is not supported by IE9 natively [`#259`](https://github.com/Financial-Times/polyfill-library/pull/259)
- String.prototype.contains is now includes, closes #240 [`#245`](https://github.com/Financial-Times/polyfill-library/pull/245)
- Shrinkwrapping, closes #242 [`#243`](https://github.com/Financial-Times/polyfill-library/pull/243)
- Atob fix [`#251`](https://github.com/Financial-Times/polyfill-library/pull/251)
- Matches ie mob [`#249`](https://github.com/Financial-Times/polyfill-library/pull/249)
- Fix broken link to lib/UA.js [`#247`](https://github.com/Financial-Times/polyfill-library/pull/247)
- Can't set window properties to undefined in IE7/8: "Not implemented", closes #239 [`#244`](https://github.com/Financial-Times/polyfill-library/pull/244)
- Add WeakMap, closes #96 [`#229`](https://github.com/Financial-Times/polyfill-library/pull/229)
- HTMLElement is undefined in IE8 [`#237`](https://github.com/Financial-Times/polyfill-library/pull/237)
- Faking high precisiong timing in requestAnimationFrame [`#236`](https://github.com/Financial-Times/polyfill-library/pull/236)
- Add WeakSet, closes #221 [`#234`](https://github.com/Financial-Times/polyfill-library/pull/234)
- Adventures in Document constructor, HTML5Shiv and cloneNode [`#222`](https://github.com/Financial-Times/polyfill-library/pull/222)
- Improve docs, fixes #215 [`#217`](https://github.com/Financial-Times/polyfill-library/pull/217)
- Object.assign on Internet Explorer Mobile [`#226`](https://github.com/Financial-Times/polyfill-library/pull/226)
- Trailing comma in config.json [`#223`](https://github.com/Financial-Times/polyfill-library/pull/223)
- Fixed erroneous parameters for Math.imul polyfill. [`#224`](https://github.com/Financial-Times/polyfill-library/pull/224)
- Blank polyfill for default Element/polyfill.js. [`#220`](https://github.com/Financial-Times/polyfill-library/pull/220)
- Fix library usage [`#210`](https://github.com/Financial-Times/polyfill-library/pull/210)
- Prefix for screen.orientation property [`#212`](https://github.com/Financial-Times/polyfill-library/pull/212)
- Fix typo and add instructions to install the npm package [`#209`](https://github.com/Financial-Times/polyfill-library/pull/209)
- fixing detect script to work in safari 5 [`#205`](https://github.com/Financial-Times/polyfill-library/pull/205)
- Adding some tests [`#206`](https://github.com/Financial-Times/polyfill-library/pull/206)
- Updating detect for CustomEvent and Event [`#200`](https://github.com/Financial-Times/polyfill-library/pull/200)
- Updating the Default set [`#199`](https://github.com/Financial-Times/polyfill-library/pull/199)
- Update setImmediate [`#185`](https://github.com/Financial-Times/polyfill-library/pull/185)
- Update Promise [`#166`](https://github.com/Financial-Times/polyfill-library/pull/166)
- Update Node.prototype.contains [`#183`](https://github.com/Financial-Times/polyfill-library/pull/183)
- Support callback param, fixes #111 [`#190`](https://github.com/Financial-Times/polyfill-library/pull/190)
- Update Opera support [`#184`](https://github.com/Financial-Times/polyfill-library/pull/184)
- Redirect legacy traffic to `legacy.<service>` [`#171`](https://github.com/Financial-Times/polyfill-library/pull/171)
- Updated compat.json [`#175`](https://github.com/Financial-Times/polyfill-library/pull/175)
- Update String.prototype.repeat [`#173`](https://github.com/Financial-Times/polyfill-library/pull/173)
- Update Object.keys [`#174`](https://github.com/Financial-Times/polyfill-library/pull/174)
- Update Event.hashchange [`#168`](https://github.com/Financial-Times/polyfill-library/pull/168)
- Fix failing tests in matches and closest by tolerating failure to throw an expected exception from queryselector [`#172`](https://github.com/Financial-Times/polyfill-library/pull/172)
- Set cache ttl to one hour for the usage endpoint [`#150`](https://github.com/Financial-Times/polyfill-library/pull/150)
- Add extra metadata to compat table entries, fixes #152, #158 [`#167`](https://github.com/Financial-Times/polyfill-library/pull/167)
- Fixing value of `this` in PolyfillSet [`#164`](https://github.com/Financial-Times/polyfill-library/pull/164)
- Update Element.prototype.mutation [`#161`](https://github.com/Financial-Times/polyfill-library/pull/161)
- Cleanup config.json [`#160`](https://github.com/Financial-Times/polyfill-library/pull/160)
- Remove unnecessary x-powered-by header.  Save a few bytes! [`#159`](https://github.com/Financial-Times/polyfill-library/pull/159)
- Updates [`#148`](https://github.com/Financial-Times/polyfill-library/pull/148)
- Update compat.html [`#157`](https://github.com/Financial-Times/polyfill-library/pull/157)
- Added iceweasel as a firefox alias closes #153 [`#154`](https://github.com/Financial-Times/polyfill-library/pull/154)
- Readsync [`#149`](https://github.com/Financial-Times/polyfill-library/pull/149)
- Put key above browser support table [`#147`](https://github.com/Financial-Times/polyfill-library/pull/147)
- Added contributing guide [`#138`](https://github.com/Financial-Times/polyfill-library/pull/138)
- Refactored events with variants, added tests and fixed a few bugs [`#141`](https://github.com/Financial-Times/polyfill-library/pull/141)
- Added some basic matchMedia tests [`#139`](https://github.com/Financial-Times/polyfill-library/pull/139)
- Fixes failing reduceRight tests in IE6 and IE7 (and probably others). [`#140`](https://github.com/Financial-Times/polyfill-library/pull/140)
- Added some Element.prototype.matches tests [`#135`](https://github.com/Financial-Times/polyfill-library/pull/135)
- Element.prototype.classList tests [`#134`](https://github.com/Financial-Times/polyfill-library/pull/134)
- Element.prototype.closest tests and browser configuration [`#137`](https://github.com/Financial-Times/polyfill-library/pull/137)
- Some initial Object.create tests [`#132`](https://github.com/Financial-Times/polyfill-library/pull/132)
- Correctly serve variant polyfills closes #130 [`#131`](https://github.com/Financial-Times/polyfill-library/pull/131)
- Array.prototype.some tests [`#129`](https://github.com/Financial-Times/polyfill-library/pull/129)
- Tests for Math.acosh [`#127`](https://github.com/Financial-Times/polyfill-library/pull/127)
- Math.asinh tests [`#128`](https://github.com/Financial-Times/polyfill-library/pull/128)
- Test framework [`#105`](https://github.com/Financial-Times/polyfill-library/pull/105)
- Update API and add method for getting a list of unaliased polyfills based on their configured browser ranges [`#121`](https://github.com/Financial-Times/polyfill-library/pull/121)
- Apply a minimum baseline [`#118`](https://github.com/Financial-Times/polyfill-library/pull/118)
- Publish head revision reference with built code so that appversion can be reported by HTTP [`#113`](https://github.com/Financial-Times/polyfill-library/pull/113)
- Add alias for default polyfill set [`#112`](https://github.com/Financial-Times/polyfill-library/pull/112)
- Added polyfill for ES6 `Math.sign` [`#115`](https://github.com/Financial-Times/polyfill-library/pull/115)
- Deploy to heroku [`#102`](https://github.com/Financial-Times/polyfill-library/pull/102)
- Range must be a node-semver range [`#101`](https://github.com/Financial-Times/polyfill-library/pull/101)
- Added browsers to Promise polyfill config.json [`#95`](https://github.com/Financial-Times/polyfill-library/pull/95)
- added strict express routing to fix infinite redirect loop [`#93`](https://github.com/Financial-Times/polyfill-library/pull/93)
- Don't show an error on `v1` path [`#92`](https://github.com/Financial-Times/polyfill-library/pull/92)
- Allow port to be specified by environment variable [`#85`](https://github.com/Financial-Times/polyfill-library/pull/85)
- Fix typo and use UTF-8 everywhere [`#83`](https://github.com/Financial-Times/polyfill-library/pull/83)
- Fix domtokenlist polyfill [`#72`](https://github.com/Financial-Times/polyfill-library/pull/72)
- Properly handle SVGElement className properties in spliceClassList. [`#37`](https://github.com/Financial-Times/polyfill-library/pull/37)
- Add detect.js files for a range of common polyfills [`#67`](https://github.com/Financial-Times/polyfill-library/pull/67)
- Expand namespaced polyfill names separated by dot separators [`#66`](https://github.com/Financial-Times/polyfill-library/pull/66)
- Adds a selection of modernizr aliases [`#65`](https://github.com/Financial-Times/polyfill-library/pull/65)
- Add browser names mappings from ua-parser to caniuse names [`#64`](https://github.com/Financial-Times/polyfill-library/pull/64)
- Add UA query string parameter, closes #46 [`#63`](https://github.com/Financial-Times/polyfill-library/pull/63)
- Make sure the addition happens *before* the division... [`#62`](https://github.com/Financial-Times/polyfill-library/pull/62)
- Add html5shiv polyfill [`#61`](https://github.com/Financial-Times/polyfill-library/pull/61)
- Combine the different 'matches' fills.  [`#60`](https://github.com/Financial-Times/polyfill-library/pull/60)
- Include SPDX identifier from the config.json in the explainer output [`#58`](https://github.com/Financial-Times/polyfill-library/pull/58)
- Add logic for using the 'gated' feature. [`#55`](https://github.com/Financial-Times/polyfill-library/pull/55)
- changed source to polyfills in link [`#56`](https://github.com/Financial-Times/polyfill-library/pull/56)
- Bundle header [`#53`](https://github.com/Financial-Times/polyfill-library/pull/53)
- Rebased alias refactor [`#50`](https://github.com/Financial-Times/polyfill-library/pull/50)
- New Readme [`#48`](https://github.com/Financial-Times/polyfill-library/pull/48)
- Issue7/metrics [`#41`](https://github.com/Financial-Times/polyfill-library/pull/41)
- Added port parameter [`#44`](https://github.com/Financial-Times/polyfill-library/pull/44)
- Correctly serve the documentation (ENOENT before) [`#43`](https://github.com/Financial-Times/polyfill-library/pull/43)
- Integrate docs into service, and redirect root to v1. Update to latest techdocs, and add ua query arg. [`#40`](https://github.com/Financial-Times/polyfill-library/pull/40)
- Manually merge in the 'add __healthcheck commit [`#39`](https://github.com/Financial-Times/polyfill-library/pull/39)
- Add minimal travis.yml [`#38`](https://github.com/Financial-Times/polyfill-library/pull/38)
- Added topological sorting of dependencies before building the response string [`#35`](https://github.com/Financial-Times/polyfill-library/pull/35)
- Add forever to package.json [`#26`](https://github.com/Financial-Times/polyfill-library/pull/26)
- Add __gtg endpoint [`#33`](https://github.com/Financial-Times/polyfill-library/pull/33)
- Issue27/simpleapi [`#30`](https://github.com/Financial-Times/polyfill-library/pull/30)
- Set cache control to one day [`#29`](https://github.com/Financial-Times/polyfill-library/pull/29)
- Add ACAO header for CORS [`#23`](https://github.com/Financial-Times/polyfill-library/pull/23)
- Starting point for Origami compliant hosted API documentation [`#17`](https://github.com/Financial-Times/polyfill-library/pull/17)
- Added Origami JSON [`#21`](https://github.com/Financial-Times/polyfill-library/pull/21)
- Fixing wrong Function.prototype.bind behavior with Array arguments [`#61`](https://github.com/Financial-Times/polyfill-library/pull/61)
- More robust matchMedia [`#58`](https://github.com/Financial-Times/polyfill-library/pull/58)
- fix el.remove() and el.replace() [`#50`](https://github.com/Financial-Times/polyfill-library/pull/50)
- create a package.json [`#35`](https://github.com/Financial-Times/polyfill-library/pull/35)
- Fix broken links [`#30`](https://github.com/Financial-Times/polyfill-library/pull/30)
- Improve `README.md` [`#29`](https://github.com/Financial-Times/polyfill-library/pull/29)
- Use Grunt for the minifying process [`#17`](https://github.com/Financial-Times/polyfill-library/pull/17)
- Update README.md: Load CSS in link element not script element [`#7`](https://github.com/Financial-Times/polyfill-library/pull/7)
- Do not serve devicePixelRatio to safari 9.1 or iOS 9.3 (#1407) [`#1406`](https://github.com/Financial-Times/polyfill-library/issues/1406)
- Make the method non-enumerable, fixes #1333 (#1393) [`#1333`](https://github.com/Financial-Times/polyfill-library/issues/1333)
- `Event.focusin` is supported in Firefox and Firefox Mobile since Version 52. (#1383) [`#1379`](https://github.com/Financial-Times/polyfill-service/issues/1379)
- dont polyfill if inside a web worker, fixes #1292 (#1394) [`#1292`](https://github.com/Financial-Times/polyfill-library/issues/1292)
- Improve DOMTokenList interface by supporting multiple arguments (#1347) [`#1222`](https://github.com/Financial-Times/polyfill-library/issues/1222)
- Add spaces around the dash to ensure it is used as a semver range (#1365) [`#1364`](https://github.com/Financial-Times/polyfill-library/issues/1364)
- Remove sourcemapURL comments from polyfills (#1283) [`#1244`](https://github.com/Financial-Times/polyfill-library/issues/1244)
- Ensure Maps and Sets have correct constructor references, fixes #1161 (#1178) [`#1161`](https://github.com/Financial-Times/polyfill-library/issues/1161) [`#1161`](https://github.com/Financial-Times/polyfill-library/issues/1161)
- Make Element.prototype.closest work for SVG nodes in IE11) (#1285) [`#1279`](https://github.com/Financial-Times/polyfill-library/issues/1279)
- Remove sourcemapURL comments from polyfills (#1283) [`#1244`](https://github.com/Financial-Times/polyfill-library/issues/1244)
- Use typeof callback === 'function' instead of instanceof (#1253) [`#1245`](https://github.com/Financial-Times/polyfill-library/issues/1245)
- Function.name is available since at least chrome 15 (#1248) [`#1052`](https://github.com/Financial-Times/polyfill-library/issues/1052)
- Default value of deep parameter should be false (Fixes #1189) (#1190) [`#1189`](https://github.com/Financial-Times/polyfill-library/issues/1189)
- Removed unused dependencies (Fixes #1229) (#1234) [`#1229`](https://github.com/Financial-Times/polyfill-library/issues/1229)
- Optimize the size tracking operations in the Map/Set polyfills (#1157) [`#1153`](https://github.com/Financial-Times/polyfill-library/issues/1153)
- Prevent Event being applied in web workers, fixes #1110 (#1146) [`#1110`](https://github.com/Financial-Times/polyfill-library/issues/1110)
- Add a feature detect for mutationobserver, fixes #1155 (#1179) [`#1155`](https://github.com/Financial-Times/polyfill-library/issues/1155)
- UA parsing for Facebook and Electron, fixes #990, #1129 (#1147) [`#990`](https://github.com/Financial-Times/polyfill-library/issues/990) [`#990`](https://github.com/Financial-Times/polyfill-library/issues/990)
- Fix #1045 - s/protoype/prototype/ (#1149) [`#1045`](https://github.com/Financial-Times/polyfill-library/issues/1045)
- Only execute the supportedLocalesOf methods if they exist - Fixes #1125 (#1126) [`#1125`](https://github.com/Financial-Times/polyfill-library/issues/1125)
- Fixed Object.getOwnPropertySymbols for Object.prototype (#1093) [`#1058`](https://github.com/Financial-Times/polyfill-library/issues/1058)
- Add pre-parse for Vivaldi, fixes #735 (#1050) [`#735`](https://github.com/Financial-Times/polyfill-library/issues/735) [`#735`](https://github.com/Financial-Times/polyfill-library/issues/735)
- Retarget Opera, fixes #860 (#1061) [`#860`](https://github.com/Financial-Times/polyfill-library/issues/860)
- Update IO polyfill, fixes #776 (#1057) [`#776`](https://github.com/Financial-Times/polyfill-library/issues/776)
- Update useragent module, fixes #749 (#1049) [`#749`](https://github.com/Financial-Times/polyfill-library/issues/749)
- Remove references to non-existent dependency polyfill, fixes #895 (#1051) [`#895`](https://github.com/Financial-Times/polyfill-library/issues/895)
- ios 9 and 10 have symbol support (#1035) - Fixes https://github.com/Financial-Times/polyfill-service/issues/1034 [`#1034`](https://github.com/Financial-Times/polyfill-service/issues/1034) [`#1034`](https://github.com/Financial-Times/polyfill-service/issues/1034)
- Fix contribution terms link, fixes #1014 (#1032) [`#1014`](https://github.com/Financial-Times/polyfill-library/issues/1014)
- Add polyfill for Number.parseFloat and Number.parseInt. (#1012) [`#980`](https://github.com/Financial-Times/polyfill-library/issues/980)
- Improve UI JS, fixes #966 (#998) [`#966`](https://github.com/Financial-Times/polyfill-library/issues/966) [`#966`](https://github.com/Financial-Times/polyfill-library/issues/966)
- Add polyfill for HTML5's `document.currentScript` (#973) [`#952`](https://github.com/Financial-Times/polyfill-library/issues/952)
- Grunt build (fixes #955) (#956) [`#955`](https://github.com/Financial-Times/polyfill-library/issues/955)
- Fix Set iteration bug #949 (#950) [`#949`](https://github.com/Financial-Times/polyfill-library/issues/949)
- Add polyfill for pre-ES6 form of `Function.name` (#951) [`#943`](https://github.com/Financial-Times/polyfill-library/issues/943)
- Polyfill console.info and console.error for IE Mobile &lt;= 9 (#914) [`#910`](https://github.com/Financial-Times/polyfill-service/issues/910) [`#910`](https://github.com/Financial-Times/polyfill-service/issues/910)
- Fix semver syntax bug, closes #931 (#932) [`#931`](https://github.com/Financial-Times/polyfill-library/issues/931) [`#931`](https://github.com/Financial-Times/polyfill-library/issues/931)
- Update config.json (#899) [`#898`](https://github.com/Financial-Times/polyfill-library/issues/898)
- values property should not be enumerable, fixes #880 (#894) [`#880`](https://github.com/Financial-Times/polyfill-library/issues/880) [`#880`](https://github.com/Financial-Times/polyfill-library/issues/880)
- Reinstate RUM improvements with fix for gated flag (#890) [`#875`](https://github.com/Financial-Times/polyfill-library/issues/875)
- Fixes #887 (#888) [`#887`](https://github.com/Financial-Times/polyfill-library/issues/887)
- Serve ArrayIterator polyfill to Samsung Browser (#877) [`#876`](https://github.com/Financial-Times/polyfill-library/issues/876)
- Add aliasing for FB in-app browser on iOS, fixes #561 (#775) [`#561`](https://github.com/Financial-Times/polyfill-library/issues/561) [`#561`](https://github.com/Financial-Times/polyfill-library/issues/561)
- Added callback type check in addEventListener to avoid exceptions (#767) [`#467`](https://github.com/Financial-Times/polyfill-library/issues/467)
- Fix https://app.getsentry.com/nextftcom/polyfill-service-dev/issues/137403821/ [`#137403821`](https://app.getsentry.com/nextftcom/polyfill-service-dev/issues/137403821)
- Fix https://app.getsentry.com/nextftcom/polyfill-service-prod/issues/116498360/ [`#116498360`](https://app.getsentry.com/nextftcom/polyfill-service-prod/issues/116498360)
- Update fetch, closes #724, closes #710 (#728) [`#724`](https://github.com/Financial-Times/polyfill-library/issues/724) [`#710`](https://github.com/Financial-Times/polyfill-library/issues/710)
- Reinstate the existing Event prototype, fixes #705 (#713) [`#705`](https://github.com/Financial-Times/polyfill-library/issues/705)
- syntax error, fixes #709 (#711) [`#709`](https://github.com/Financial-Times/polyfill-library/issues/709)
- Fix TLS redirect, fixes #707 [`#707`](https://github.com/Financial-Times/polyfill-library/issues/707)
- Implement Set polyfill, closes #680 (#694) [`#680`](https://github.com/Financial-Times/polyfill-library/issues/680)
- Add navigator.sendBeacon, closes #539 (#689) [`#539`](https://github.com/Financial-Times/polyfill-library/issues/539)
- Force TLS, and update VCL on deploy, closes #677 (#682) [`#677`](https://github.com/Financial-Times/polyfill-library/issues/677)
- Add getElementsByClassName, closes #169 (#688) [`#169`](https://github.com/Financial-Times/polyfill-library/issues/169)
- Fix https://app.getsentry.com/nextftcom/polyfill-service-prod/issues/116498360/ [`#116498360`](https://app.getsentry.com/nextftcom/polyfill-service-prod/issues/116498360)
- Use Node 6 to handle HTTP clientError scenarios correctly, fixes #567 (#686) [`#567`](https://github.com/Financial-Times/polyfill-library/issues/567)
- Exclude option, closes #435 (#683) [`#435`](https://github.com/Financial-Times/polyfill-library/issues/435)
- Merge pull request #641 from Financial-Times/testcurrent [`#611`](https://github.com/Financial-Times/polyfill-library/issues/611)
- Merge pull request #656 from Financial-Times/url-test-ff [`#640`](https://github.com/Financial-Times/polyfill-library/issues/640)
- Merge branch 'master' of github.com:Financial-Times/polyfill-service into symbol [`#642`](https://github.com/Financial-Times/polyfill-library/issues/642)
- Merge pull request #657 from buzinas/patch-1 [`#642`](https://github.com/Financial-Times/polyfill-library/issues/642)
- Updated browser support - Fixes #642 [`#642`](https://github.com/Financial-Times/polyfill-library/issues/642)
- Merge pull request #637 from Financial-Times/nan [`#608`](https://github.com/Financial-Times/polyfill-library/issues/608)
- Merge branch 'master' of github.com:Financial-Times/polyfill-service into symbol [`#621`](https://github.com/Financial-Times/polyfill-library/issues/621)
- Allow full indexing, fixes #621 [`#621`](https://github.com/Financial-Times/polyfill-library/issues/621)
- Update browser targeting, fixes #404 [`#404`](https://github.com/Financial-Times/polyfill-library/issues/404)
- Add Safari mobile webview, fixes #579 [`#579`](https://github.com/Financial-Times/polyfill-library/issues/579)
- Merge pull request #584 from deddu/master [`#566`](https://github.com/Financial-Times/polyfill-library/issues/566)
- Merge pull request #573 from Financial-Times/more-unknown [`#572`](https://github.com/Financial-Times/polyfill-library/issues/572)
- Update semver lib, fixes #563 [`#563`](https://github.com/Financial-Times/polyfill-library/issues/563)
- Merge pull request #569 from Financial-Times/console [`#557`](https://github.com/Financial-Times/polyfill-library/issues/557)
- Update deps, fixes #491 [`#491`](https://github.com/Financial-Times/polyfill-library/issues/491)
- Fix #495: basedir only worked when built on the same system as where it was used.  If built on a different system before deployment, the path replacement did not work.  Path is now relative [`#495`](https://github.com/Financial-Times/polyfill-library/issues/495)
- Update fetch, closes #494 [`#494`](https://github.com/Financial-Times/polyfill-library/issues/494)
- Update browser support, closes #469 [`#469`](https://github.com/Financial-Times/polyfill-library/issues/469)
- Merge pull request #458 from Financial-Times/polyfill-basedir [`#438`](https://github.com/Financial-Times/polyfill-library/issues/438) [`#454`](https://github.com/Financial-Times/polyfill-library/issues/454)
- Extend placeholder polyfill to IE9, closes #443 [`#443`](https://github.com/Financial-Times/polyfill-library/issues/443)
- Use correct browser names, fixes #422 [`#422`](https://github.com/Financial-Times/polyfill-library/issues/422)
- Correct documentation, closes #405 [`#405`](https://github.com/Financial-Times/polyfill-library/issues/405)
- Fix event delegation, fixes #391 [`#391`](https://github.com/Financial-Times/polyfill-library/issues/391)
- Use HTTPS in examples, closes #386 [`#386`](https://github.com/Financial-Times/polyfill-library/issues/386)
- Cuts the mustard for docs, improve availability stats, fixes #367 [`#367`](https://github.com/Financial-Times/polyfill-library/issues/367)
- Apply CustomEvent polyfill in Android &lt; 4.4, fixes #378 [`#378`](https://github.com/Financial-Times/polyfill-library/issues/378)
- RAF is prefixed in iOS 6.1, fixes #390 [`#390`](https://github.com/Financial-Times/polyfill-library/issues/390)
- Correct metadata, fixes #375 [`#375`](https://github.com/Financial-Times/polyfill-library/issues/375)
- Merge pull request #372 from Financial-Times/standardise-detects [`#332`](https://github.com/Financial-Times/polyfill-library/issues/332)
- Better IIFE, fixes #352 [`#352`](https://github.com/Financial-Times/polyfill-library/issues/352)
- document.head is required by geolocation, fixes #335 [`#335`](https://github.com/Financial-Times/polyfill-library/issues/335)
- Add detect for setImmediate, fixes #353 [`#353`](https://github.com/Financial-Times/polyfill-library/issues/353)
- Merge pull request #338 from Financial-Times/contributor-terms [`#327`](https://github.com/Financial-Times/polyfill-library/issues/327)
- Add default flag to legend, fixes #330 [`#330`](https://github.com/Financial-Times/polyfill-library/issues/330)
- Avoid confusion when running build task, fixes #325 [`#325`](https://github.com/Financial-Times/polyfill-library/issues/325)
- Merge pull request #315 from Financial-Times/promise-array-test [`#307`](https://github.com/Financial-Times/polyfill-library/issues/307)
- Fix #307 [`#307`](https://github.com/Financial-Times/polyfill-library/issues/307)
- Merge pull request #314 from Financial-Times/triblondon-patch-1 [`#308`](https://github.com/Financial-Times/polyfill-library/issues/308)
- Fix targeting of Array.prototype.find, fixes #308 [`#308`](https://github.com/Financial-Times/polyfill-library/issues/308)
- Fix typo in polyfills/Events/tests.js: 'should should' -&gt; 'should'. Fixes #309 [`#309`](https://github.com/Financial-Times/polyfill-library/issues/309)
- Merge pull request #306 from tejacques/bug_302 [`#302`](https://github.com/Financial-Times/polyfill-library/issues/302)
- delete element._events[type] when last listener is removed. Fixes #302 [`#302`](https://github.com/Financial-Times/polyfill-library/issues/302)
- Allow symlinks to be included in sources file, fixes #285 [`#285`](https://github.com/Financial-Times/polyfill-library/issues/285)
- Fixes #299, added test [`#299`](https://github.com/Financial-Times/polyfill-library/issues/299)
- Merge pull request #295 from Financial-Times/array-contains-bug [`#294`](https://github.com/Financial-Times/polyfill-library/issues/294)
- Merge pull request #276 from Financial-Times/enableunknown [`#252`](https://github.com/Financial-Times/polyfill-library/issues/252)
- Merge pull request #275 from Financial-Times/aliasall [`#258`](https://github.com/Financial-Times/polyfill-library/issues/258)
- Merge pull request #269 from Financial-Times/precompile [`#233`](https://github.com/Financial-Times/polyfill-library/issues/233)
- Support 'unknown' param, closes #252.  Tidy and reorg service/lib interface [`#252`](https://github.com/Financial-Times/polyfill-library/issues/252)
- Merge pull request #246 from Financial-Times/fetch [`#109`](https://github.com/Financial-Times/polyfill-library/issues/109)
- Merge pull request #245 from Financial-Times/string.includes [`#240`](https://github.com/Financial-Times/polyfill-library/issues/240)
- Merge pull request #243 from Financial-Times/version-lock [`#242`](https://github.com/Financial-Times/polyfill-library/issues/242)
- Merge pull request #244 from Financial-Times/issue-239 [`#239`](https://github.com/Financial-Times/polyfill-library/issues/239)
- Merge pull request #229 from Financial-Times/weakmap [`#96`](https://github.com/Financial-Times/polyfill-library/issues/96)
- Merge pull request #234 from Financial-Times/weakset [`#221`](https://github.com/Financial-Times/polyfill-library/issues/221)
- Add WeakSet, closes #221. [`#221`](https://github.com/Financial-Times/polyfill-library/issues/221)
- Add WeakMap, closes #96 [`#96`](https://github.com/Financial-Times/polyfill-library/issues/96)
- Code no longer referenced from config.json, and it looks unlikely that we'll fix this soon.  Closes #144 [`#144`](https://github.com/Financial-Times/polyfill-library/issues/144)
- Remove tests for focusin until we can resolve #213 [`#213`](https://github.com/Financial-Times/polyfill-library/issues/213)
- Merge pull request #217 from Financial-Times/docs [`#215`](https://github.com/Financial-Times/polyfill-library/issues/215)
- Fix #203, and move the cloneNode polyfill into a new entry with tests. [`#203`](https://github.com/Financial-Times/polyfill-library/issues/203)
- Improve docs, fixes #215 [`#215`](https://github.com/Financial-Times/polyfill-library/issues/215)
- Remove redirects from cdn to legacy, since canonical domain now has whitelist embedded.  Fixes #214 [`#214`](https://github.com/Financial-Times/polyfill-library/issues/214)
- Phantom JS -&gt; safari/5, and support more intelligent aliasing, closes #208 [`#208`](https://github.com/Financial-Times/polyfill-library/issues/208)
- Polyfill bundle size chart, closes #207 [`#207`](https://github.com/Financial-Times/polyfill-library/issues/207)
- Merge pull request #190 from Financial-Times/callback [`#111`](https://github.com/Financial-Times/polyfill-library/issues/111)
- Support callback param, fixes #111 [`#111`](https://github.com/Financial-Times/polyfill-library/issues/111)
- Add link to repo on every page of docs, fixes #151 [`#151`](https://github.com/Financial-Times/polyfill-library/issues/151)
- Update Node.prototype.contains [`#177`](https://github.com/Financial-Times/polyfill-library/issues/177)
- Update String.prototype.repeat [`#103`](https://github.com/Financial-Times/polyfill-library/issues/103)
- Update Object.keys [`#99`](https://github.com/Financial-Times/polyfill-library/issues/99)
- Merge pull request #167 from Financial-Times/better-compat-table [`#152`](https://github.com/Financial-Times/polyfill-library/issues/152)
- Add extra metadata to compat table entries, fixes #152 [`#152`](https://github.com/Financial-Times/polyfill-library/issues/152)
- Merge pull request #154 from Financial-Times/iceweasel [`#153`](https://github.com/Financial-Times/polyfill-library/issues/153)
- Added iceweasel as a firefox alias closes #153 [`#153`](https://github.com/Financial-Times/polyfill-library/issues/153)
- Fix file naming typo, closes #136 [`#136`](https://github.com/Financial-Times/polyfill-library/issues/136)
- Merge pull request #131 from Financial-Times/variants-issue130 [`#130`](https://github.com/Financial-Times/polyfill-library/issues/130)
- Correctly serve variant polyfills closes #130 [`#130`](https://github.com/Financial-Times/polyfill-library/issues/130)
- Merge pull request #63 from Financial-Times/issue46/uaquery [`#46`](https://github.com/Financial-Times/polyfill-library/issues/46)
- Add UA query string parameter, closes #46 [`#46`](https://github.com/Financial-Times/polyfill-library/issues/46)
- Revert unnecessary whitespace changes [`2133994`](https://github.com/Financial-Times/polyfill-library/commit/21339947190701de76ffe3afca50e1513d006cd9)
- Convert all space indentation to tab indentiation in the config files [`f53a656`](https://github.com/Financial-Times/polyfill-library/commit/f53a656e477ecd13ceb307623e8111ac096b2735)
- update Intl.js polyfill to version 1.1.0 [`c43ef44`](https://github.com/Financial-Times/polyfill-library/commit/c43ef44d680800412c1fcb11419df8cefab1da8e)
