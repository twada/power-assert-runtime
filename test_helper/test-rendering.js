'use strict';

var createFormatter = require('../packages/power-assert-context-formatter');
var baseAssert = require('assert');

module.exports = function testRendering (body, expectedLines, renderers) {
    try {
        body();
        baseAssert.fail('AssertionError should be thrown');
    } catch (e) {
        var format = createFormatter({
            outputOffset: 0,
            renderers: renderers
        });
        baseAssert.equal(format(e.powerAssertContext), expectedLines.join('\n') + '\n');
    }
};
