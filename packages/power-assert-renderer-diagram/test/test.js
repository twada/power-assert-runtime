'use strict';

delete require.cache[require.resolve('..')];
var DiagramRenderer = require('..');
var AssertionRenderer = require('power-assert-renderer-assertion');
var assert = require('../../../test_helper/empowered-assert');
var transpile = require('../../../test_helper/transpile');
var testRendering = require('../../../test_helper/test-rendering');

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
