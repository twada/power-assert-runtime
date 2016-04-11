'use strict';

delete require.cache[require.resolve('..')];
var SuccinctRenderer = require('..');
var createRendererTester = require('../../../test_helper/create-renderer-tester');
var test = createRendererTester(SuccinctRenderer);
var assert = require('../../../test_helper/empowered-assert');

describe('SuccinctRenderer', function () {

    test('BinaryExpression', function (transpiledCode) {
        var foo = 'foo';
        var bar = 'bar';
        eval(transpiledCode);
    }, [
        'assert(foo === bar)',
        '       |       |   ',
        '       "foo"   "bar"',
    ]);
    
    test('StringLiteral', function (transpiledCode) {
        var foo = 'foo';
        eval(transpiledCode);
    }, [
        'assert(foo === "bar")',
        '       |             ',
        '       "foo"         '
    ]);

});
