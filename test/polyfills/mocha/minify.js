const uglify = require('uglify-js');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, 'mocha.js'), 'utf8');

const minified = uglify.minify(source, {
	compress: {
		keep_fnames: true
	},
	mangle: {},
	output: {
		beautify: false
	}
});

fs.writeFileSync(path.join(__dirname, 'mocha.min.js'), minified.code);
