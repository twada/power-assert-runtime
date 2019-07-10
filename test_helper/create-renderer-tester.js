'use strict';

const AssertionRenderer = require('../packages/power-assert-renderer-assertion');
const AstReducer = require('../packages/power-assert-context-reducer-ast');
const transpile = require('./transpile');
const testRendering = require('./test-rendering');

module.exports = function createRendererTester (renderer) {
    return (title, body, expectedLines) => {
        const expression = expectedLines[0];
        it(title + ': ' + expression, function () {
            testRendering(function () {
                body(transpile(expression));
            }, [''].concat(expectedLines), {
                pipeline: [AstReducer, AssertionRenderer, renderer]
            });
        });
    };
};
