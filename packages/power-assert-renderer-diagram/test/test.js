'use strict';

delete require.cache[require.resolve('..')];
var DiagramRenderer = require('..');
var createRendererTester = require('../../../test_helper/create-renderer-tester');
var test = createRendererTester(DiagramRenderer);
var assert = require('../../../test_helper/empowered-assert');

describe('DiagramRenderer', function () {

    test('BinaryExpression', function (transpiledCode) {
        var foo = 'foo';
        var bar = 'bar';
        eval(transpiledCode);
    }, [
        'assert(foo === bar)',
        '       |   |   |   ',
        '       |   |   "bar"',
        '       |   false   ',
        '       "foo"       '
    ]);
    
    test('StringLiteral', function (transpiledCode) {
        var foo = 'foo';
        eval(transpiledCode);
    }, [
        'assert(foo === "bar")',
        '       |   |         ',
        '       |   false     ',
        '       "foo"         '
    ]);

});
