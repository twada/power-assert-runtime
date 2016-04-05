'use strict';

delete require.cache[require.resolve('..')];
var DiagramRenderer = require('..');

var ContextTraversal = require('power-assert-context-traversal');
var AssertionRenderer = require('power-assert-renderer-assertion');

var baseAssert = require('assert');
var babel = require('babel-core');
var createEspowerPlugin = require('babel-plugin-espower/create');
var empower = require('empower-core');
var assert = empower(baseAssert);

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

describe('DiagramRenderer', function () {
    it('assert(foo === bar)', function () {
        try {
            var foo = 'foo';
            var bar = 'bar';
            eval(transpile('assert(foo === bar)'));
        } catch (e) {
            var traversal = new ContextTraversal(e.powerAssertContext);
            var lines = [];
            var dest = {
                write: function (str) {
                    lines.push(str);
                }
            };
            var ar = new AssertionRenderer();
            ar.register(traversal);
            ar.setDestination(dest);
            var dr = new DiagramRenderer();
            dr.register(traversal);
            dr.setDestination(dest);

            traversal.traverse();

            baseAssert.deepEqual(lines, [
                '',
                'assert(foo === bar)',
                '       |   |   |   ',
                '       |   |   "bar"',
                '       |   false   ',
                '       "foo"       '
            ]);
        }
    });
});
