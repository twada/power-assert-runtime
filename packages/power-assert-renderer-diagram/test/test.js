'use strict';

delete require.cache[require.resolve('..')];
var DiagramRenderer = require('..');
var AssertionRenderer = require('power-assert-renderer-assertion');

var helper = require('../../../test_helper/helper');
var assert = helper.assert;
var transpile = require('../../../test_helper/transpile');
var testRendering = helper.testRendering;

describe('DiagramRenderer', function () {
    it('assert(foo === bar)', function () {
        var foo = 'foo';
        var bar = 'bar';
        testRendering(function () {
            eval(transpile('assert(foo === bar)'));
        }, [
            '',
            'assert(foo === bar)',
            '       |   |   |   ',
            '       |   |   "bar"',
            '       |   false   ',
            '       "foo"       '
        ], [AssertionRenderer, DiagramRenderer]);
    });
});
