'use strict';

var createFormatter = require('../packages/power-assert-context-formatter');
var baseAssert = require('assert');
var assign = require('core-js/library/fn/object/assign');

module.exports = function testRendering (body, expectedLines, formatterOptions) {
    try {
        body();
        baseAssert.fail('AssertionError should be thrown');
    } catch (e) {
        baseAssert.equal(typeof e.powerAssertContext, 'object', 'powerAssertContext should exist');
        var format = createFormatter(assign({}, {
            outputOffset: 0
        }, formatterOptions));
        baseAssert.equal(format(e.powerAssertContext), expectedLines.join('\n') + '\n');
    }
};
