'use strict';

delete require.cache[require.resolve('..')];
var AssertionRenderer = require('..');

var helper = require('../../../test_helper/helper');
var assert = helper.assert;
var transpile = helper.transpile;
var testRendering = helper.testRendering;

describe('AssertionRenderer', function () {
    it('assert(foo === bar)', function () {
        var foo = 'foo';
        var bar = 'bar';
        testRendering(function () {
            eval(transpile('assert(foo === bar)'));
        }, [
            '',
            'assert(foo === bar)'
        ], [AssertionRenderer]);
    });
});
