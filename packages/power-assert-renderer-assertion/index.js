'use strict';

var BaseRenderer = require('power-assert-renderer-base');
var inherits = require('util').inherits;

function AssertionRenderer (config) {
    BaseRenderer.call(this, config);
}
inherits(AssertionRenderer, BaseRenderer);

AssertionRenderer.prototype.onStart = function (context) {
    this.assertionLine = context.source.content;
};

AssertionRenderer.prototype.onEnd = function () {
    this.write('');
    this.write(this.assertionLine);
};

module.exports = AssertionRenderer;
