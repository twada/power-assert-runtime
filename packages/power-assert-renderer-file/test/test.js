'use strict';

delete require.cache[require.resolve('..')];
var FileRenderer = require('..');
var assert = require('../../../test_helper/empowered-assert');
var transpile = require('../../../test_helper/transpile');
var testRendering = require('../../../test_helper/test-rendering');

describe('FileRenderer', function () {

    it('assert(foo === bar)', function () {
        var foo = 'foo';
        var bar = 'bar';
        testRendering(function () {
            eval(transpile('assert(foo === bar)'));
        }, [
            '# test/some_test.js:1'
        ], { renderers: [FileRenderer] });
    });

    it('line number detection', function () {
        var falsyStr = '';
        testRendering(function () {
            eval(transpile('var i = 0;\n\nassert(falsyStr)'));
        }, [
            '# test/some_test.js:3'
        ], { renderers: [FileRenderer] });
    });

});
