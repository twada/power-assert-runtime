'use strict';

const createFormatter = require('../packages/power-assert-context-formatter');
const baseAssert = require('assert');

module.exports = function testRendering (body, expectedLines, formatterOptions) {
    try {
        body();
        baseAssert.fail('AssertionError should be thrown');
    } catch (e) {
        baseAssert.equal(typeof e.powerAssertContext, 'object', 'powerAssertContext should exist');
        const format = createFormatter(Object.assign({}, {
            outputOffset: 0
        }, formatterOptions));
        baseAssert.equal(format(e.powerAssertContext), expectedLines.join('\n') + '\n');
    }
};
