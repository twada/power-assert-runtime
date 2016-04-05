'use strict';

delete require.cache[require.resolve('..')];
var ComparisonRenderer = require('..');
var AssertionRenderer = require('power-assert-renderer-assertion');

var helper = require('../../../test_helper/helper');
var assert = helper.assert;
var transpile = require('../../../test_helper/transpile');
var testRendering = helper.testRendering;

describe('ComparisonRenderer', function () {
    it('assert(foo === bar)', function () {
        var foo = 'foo';
        var bar = 'bar';
        testRendering(function () {
            eval(transpile('assert(foo === bar)'));
        }, [
            '',
            'assert(foo === bar)',
            '',
            '--- [string] bar',
            '+++ [string] foo',
            '@@ -1,3 +1,3 @@\n-bar\n+foo\n'
        ], [AssertionRenderer, ComparisonRenderer]);
    });
});
