import path from "node:path";
import fs from "node:fs";
import TOML from '@iarna/toml';

const browsers = ['ie', 'chrome', 'edge', 'firefox', 'ios', 'safari'];

for (const browser of browsers) {
	const versions = browserVersions(browser);
	const workflow = workflowFileContents(browser);

	workflow.jobs.test.strategy.matrix.browser_version = versions;

	updateWorkflowFileContents(browser, workflow);
}

function workflowFileContents(browser) {
	return JSON.parse(fs.readFileSync(workflowFilePath(browser), 'utf8'));
}

function updateWorkflowFileContents(browser, contents) {
	fs.writeFileSync(workflowFilePath(browser), JSON.stringify(contents, undefined, '  '));
}

function workflowFilePath(browser) {
	return path.join('.github', 'workflows', `test-polyfills-${browser}.yml`);
}

function browserVersions(browser) {
	const browsersFilePath = path.join('test', 'polyfills', 'browsers.toml');
	const browsers = TOML.parse(fs.readFileSync(browsersFilePath, 'utf8')).browsers;

	return browsers.map(x => {
		const [b, version] = x.split('/');
		if (b !== browser) {
			return -1;
		}
		return version;
	}).filter(version => version !== -1);
}
