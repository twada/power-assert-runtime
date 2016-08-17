'use strict';

var AssertionRenderer = require('../packages/power-assert-renderer-assertion');
var transpile = require('./transpile');
var testRendering = require('./test-rendering');

module.exports = function createRendererTester (renderer) {
    return function (title, body, expectedLines) {
        var expression = expectedLines[0];
        it(title + ': ' + expression, function () {
            testRendering(function () {
                body(transpile(expression));
            }, [''].concat(expectedLines), {
                renderers: [AssertionRenderer, renderer]
            });
        });
    };
}
