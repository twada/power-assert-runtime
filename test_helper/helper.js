'use strict';

var ContextTraversal = require('../packages/power-assert-context-traversal');
var baseAssert = require('assert');
var empower = require('empower-core');
var babel = require('babel-core');
var createEspowerPlugin = require('babel-plugin-espower/create');

function transpile (code) {
    return babel.transform(code, {
        filename: '/absolute/path/to/project/test/some_test.js',
        plugins: [
            createEspowerPlugin(babel, {
                sourceRoot: '/absolute/path/to/project'
            })
        ]
    }).code;
}

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
    assert: empower(baseAssert),
    transpile: transpile,
    testRendering: testRendering
};
