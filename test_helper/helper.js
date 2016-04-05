'use strict';

var ContextTraversal = require('../packages/power-assert-context-traversal');
var baseAssert = require('assert');

function testRendering (body, expectedLines, targetRenderers) {
    try {
        body();
        baseAssert.fail('AssertionError should be thrown');
    } catch (e) {
        var traversal = new ContextTraversal(e.powerAssertContext);
        var lines = [];
        var dest = {
            write: function (str) {
                lines.push(str);
            }
        };
        targetRenderers.forEach(function (TargetRenderer) {
            var ar = new TargetRenderer();
            ar.register(traversal);
            ar.setDestination(dest);
        });
        traversal.traverse();
        baseAssert.deepEqual(lines, expectedLines);
    }
}

module.exports = {
    testRendering: testRendering
};
