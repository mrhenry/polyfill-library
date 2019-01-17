'use strict';

const sinon = require('sinon');

module.exports = {
	polyfillExists: sinon.stub().resolves(),
	getPolyfillMeta: sinon.stub().resolves(),
	listPolyfills: sinon.stub().resolves(),
	getConfigAliases: sinon.stub().resolves(),
	streamPolyfillSource: sinon.stub(),
};
