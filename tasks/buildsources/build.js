'use strict';

const fs = require('node:fs');
const path = require('node:path');
const child_process = require('node:child_process');

const source = path.join(__dirname, '../../polyfills');
const destination = path.join(source, '__dist');

const Polyfill = require('./polyfill');
const checkDependenciesExist = require('./check-dependencies-exist');
const flattenPolyfillDirectories = require('./flatten-polyfill-directories');
const writeAliasFile = require('./write-alias-file');
const writeMetaFile = require('./write-meta-file');
const toposortPolyfills = require('./toposort-polyfills');

/**
 * Build all or a single polyfill.
 *
 * @param {string|undefined} feature An optional feature to build. When omitted all polyfills will be build.
 * @returns {Promise<void>} When done.
 */
module.exports = async function build(feature) {
	await fs.promises.mkdir(destination, { recursive: true });

	const queues = [];

	const maxProc = Math.max(
		require("node:os").cpus().length,
		6
	);

	const slicedPolyfillPaths = [];
	const polyfillPaths = await flattenPolyfillDirectories(source);

	for (let queue = 0; queue < maxProc; queue++) {
		const start = Math.floor((polyfillPaths.length / maxProc) * queue);
		const end = Math.floor((polyfillPaths.length / maxProc) * (queue + 1));
		slicedPolyfillPaths.push(polyfillPaths.slice(start, end));
	}

	const children = [];

	for (const slice of slicedPolyfillPaths) {
		queues.push(new Promise((resolve, reject) => {
			const child = child_process.fork(path.join(__dirname, 'buildsources-child-proc'));
			children.push(child);

			child.on('message', function (message) {
				if (message.result) {
					resolve(message.result.map((polyfillData) => {
						return Polyfill.fromJSON(polyfillData);
					}));
				} else {
					reject(message.error);

					for (const c of children) {
						c.kill();
					}
				}
			});

			child.send({
				source: source,
				destination: destination,
				list: slice,
				onlyBuildFeature: feature
			});
		}));
	}

	const polyfills = await Promise.all(queues).then((resolvedQueues) => {
		return resolvedQueues.flat();
	});

	const toposortedPolyfills = toposortPolyfills(polyfills);
	polyfills.sort((a, b) => toposortedPolyfills.indexOf(a.name) - toposortedPolyfills.indexOf(b.name));

	checkDependenciesExist(polyfills);

	console.log('Waiting for files to be written to disk...')
	await writeAliasFile(polyfills, destination);
	await writeMetaFile(polyfills, destination);
}
