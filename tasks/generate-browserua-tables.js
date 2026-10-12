'use strict';

const fs = require('node:fs');
const path = require('node:path');
const UA = require('@financial-times/polyfill-useragent-normaliser');

// The Go BrowserStack runner (scripts/browserua) needs the same browser
// baselines and Opera remap the polyfill build uses. Generating them from the
// normaliser keeps a single source of truth instead of a hand-maintained copy
// in Go.
//
// Regenerate with `npm run generate-browserua-tables`.

const baselines = UA.getBaselines();

// The normaliser does not export its Opera-to-Chrome remap, so probe it.
const operaToChrome = {};
for (let major = 1; major <= 200; major++) {
	const ua = new UA(`opera/${major}.0`);
	if (ua.getFamily() !== 'chrome') {
		continue;
	}

	const [chromeMajor, chromeMinor] = ua.getVersion().split('.').map(Number);
	operaToChrome[major] = { major: chromeMajor, minor: chromeMinor };
}

const output = path.join(__dirname, '../scripts/browserua/tables.json');

fs.writeFileSync(output, `${JSON.stringify({ baselines, operaToChrome }, undefined, '\t')}\n`);

console.log(`Wrote ${path.relative(path.join(__dirname, '..'), output)}`);
