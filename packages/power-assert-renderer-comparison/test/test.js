'use strict';

delete require.cache[require.resolve('..')];
var ComparisonRenderer = require('..');
var createRendererTester = require('../../../test_helper/create-renderer-tester');
var test = createRendererTester(ComparisonRenderer);
var assert = require('../../../test_helper/empowered-assert');

describe('ComparisonRenderer', function () {

    test('BinaryExpression', function (transpiledCode) {
        var foo = 'foo';
        var bar = 'bar';
        eval(transpiledCode);
    }, [
        'assert(foo === bar)',
        '',
        '--- [string] bar',
        '+++ [string] foo',
        '@@ -1,3 +1,3 @@',
        '-bar',
        '+foo',
        ''
    ]);
    
    test('StringLiteral', function (transpiledCode) {
        var foo = 'foo';
        eval(transpiledCode);
    }, [
        'assert(foo === "bar")',
        '',
        '--- [string] "bar"',
        '+++ [string] foo',
        '@@ -1,3 +1,3 @@',
        '-bar',
        '+foo',
        ''
    ]);
    
    test('mutiline diff', function (transpiledCode) {
        var foo = 'foo\nbar';
        eval(transpiledCode);
    }, [
        'assert(foo === "foo\\r\\nbar")',
        '',
        '--- [string] "foo\\r\\nbar"',
        '+++ [string] foo',
        '@@ -1,8 +1,7 @@',
        ' foo',
        '-\r',
        ' ',
        'bar',
        ''
    ]);

});
