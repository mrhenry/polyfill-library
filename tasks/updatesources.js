'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {promisify} = require('node:util');
const glob = promisify(require('glob'));
const TOML = require('@iarna/toml');
const cwd = path.join(__dirname, '../');
const globOptions = { cwd: cwd };

const loadSource = polyfillPaths => {
	return polyfillPaths.map(p => fs.readFileSync(p)).join('');
};

const installPolyfill = config => {
	const polyfillOutputFolder = path.dirname(config.src);
	const polyfillOutputPath = path.join(polyfillOutputFolder, 'polyfill.js');

	const polyfillSourcePaths = (config.install.paths || ['']).map((p) => {
		return require.resolve(path.join(config.install.module, p), [polyfillOutputFolder])
	});

	const newPolyfill = loadSource(polyfillSourcePaths);

	polyfillSourcePaths.map(p => console.log('  from ' + path.relative(cwd, p)));

	fs.writeFileSync(polyfillOutputPath, newPolyfill);

	if (config.install.postinstall) {
		console.log(' * Running module-specific update task ' + config.install.postinstall);
		require(path.resolve(polyfillOutputFolder, config.install.postinstall));
	}
};

console.log('Updating third-party polyfills...');
glob('polyfills/**/config.toml', globOptions)
	.then(files => {
		for (const toml of files
			.map(source => {
				try {
					return Object.assign({ src: source }, TOML.parse(fs.readFileSync(source, 'utf-8')));
				} catch (error) {
					throw new Error('Failed on ' + source + '. Error: ' + error);
				}
			})
			.filter(config => 'install' in config))  installPolyfill(toml);

	})
	.then(() => console.log('Polyfills updated successfully'))
	.catch(error => {
		console.log(error);

		process.exit(1);
	})
;
