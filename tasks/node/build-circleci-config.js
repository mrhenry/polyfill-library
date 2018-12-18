"use strict";

const path = require('path');
const fs = require('fs');
const yaml = require('yaml');
const globby = require('globby');
const circleConfig = yaml.parse(fs.readFileSync(path.join(__dirname, './circleci-config.yml'), 'utf8'));
circleConfig.commentBefore ='Do not modify this file directly, it is built by ./tasks/node/build-circleci-config.js.'

const polyfillsWhichHaveTests = globby.sync(['polyfills/**/tests.js', '!polyfills/__dist'], {
    transform: (entry) => entry.replace('polyfills/', '').replace('/tests.js', '').replace(/\//g, '.')
});

for (const feature of polyfillsWhichHaveTests) {
    const testCommand = `npm run test-polyfills -- --feature=${feature} --browserstack`;
    const job = {
        docker: [{
            image: 'circleci/node:10'
        }],
        steps: [
            'checkout',
            {
                run: 'yarn install --frozen-lockfile'
            },
            {
                run: testCommand
            }
        ]
    }
    const jobName = `test_${feature.replace(/\./g, '_').replace(/@/g, '')}`
    circleConfig.jobs[jobName] = job;
    circleConfig.workflows.test.jobs.push({
        [jobName]: {
            filters: {
                tags: {
                    ignore: "/^v.*/"
                },
                branches: {
                    ignore: "master"
                }
            },
            requires: ["lint_js", "unit_tests", ...Object.keys(circleConfig.jobs).filter(job => job.startsWith('test_'))]
        }
    })
}
fs.writeFileSync(path.join(__dirname, '../../.circleci/config.yml'), yaml.stringify(circleConfig))