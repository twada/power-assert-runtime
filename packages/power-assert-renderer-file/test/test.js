'use strict';

delete require.cache[require.resolve('..')];
var FileRenderer = require('..');

var helper = require('../../../test_helper/helper');
var assert = helper.assert;
var transpile = require('../../../test_helper/transpile');
var testRendering = helper.testRendering;

describe('FileRenderer', function () {
    it('assert(foo === bar)', function () {
        var foo = 'foo';
        var bar = 'bar';
        testRendering(function () {
            eval(transpile('assert(foo === bar)'));
        }, [
            '# test/some_test.js:1'
        ], [FileRenderer]);
    });
});
