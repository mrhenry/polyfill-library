'use strict';

const path = require('node:path');

const source = path.join(__dirname, '../../polyfills');
const destination = path.join(source, '__dist');

const build = require('./build');

console.log(`Writing compiled polyfill sources to ${destination}/...`);

build()
	.then(() => {
		console.log('Sources built successfully');
	})
	.catch(error => {
		console.log(error);
		console.log(JSON.stringify(error));

		process.exit(1);
	});
