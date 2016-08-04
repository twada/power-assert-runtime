'use strict';

delete require.cache[require.resolve('..')];
var AssertionRenderer = require('..');
var assert = require('../../../test_helper/empowered-assert');
var transpile = require('../../../test_helper/transpile');
var testRendering = require('../../../test_helper/test-rendering');
var appendAst = require('power-assert-context-reducer-ast');

describe('AssertionRenderer', function () {

    it('assert(foo === bar)', function () {
        var foo = 'foo';
        var bar = 'bar';
        testRendering(function () {
            eval(transpile('assert(foo === bar)'));
        }, [
            '',
            'assert(foo === bar)'
        ], { renderers: [AssertionRenderer] });
    });

    it('show syntax error when there are some parse errors caused by not supported syntax', function () {
        var a = 'a';
        var b = 'b';
        var obj = { foo: 'FOO', bar: 'BAR' };
        testRendering(function () {
            eval(transpile('assert.deepEqual({ b, ...obj }, { a, ...obj })', false));
        }, [
            '',
            'assert.deepEqual({ b, ...obj }, { a, ...obj })',
            '                      ?                       ',
            '                      ?                       ',
            '                      SyntaxError: Unexpected token (1:22)'
        ], {
            reducers: [
                appendAst
            ],
            renderers: [AssertionRenderer]
        });
    });

});
