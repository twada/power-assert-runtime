'use strict';

delete require.cache[require.resolve('..')];
var SuccinctRenderer = require('..');
var createRendererTester = require('../../../test_helper/create-renderer-tester');
var test = createRendererTester(SuccinctRenderer);
var assert = require('../../../test_helper/empowered-assert');

describe('SuccinctRenderer', function () {

    test('Identifier', function (transpiledCode) {
        var truthy = false;
        eval(transpiledCode);
    }, [
        'assert(truthy)',
        '       |      ',
        '       false  ',
    ]);
    
    test('MemberExpression', function (transpiledCode) {
        var en = { foo: false };
        eval(transpiledCode);
    }, [
        'assert(en.foo)',
        '          |   ',
        '          false',
    ]);
    
    test('deep MemberExpression', function (transpiledCode) {
        var en = { foo: { bar: false } };
        eval(transpiledCode);
    }, [
        'assert(en.foo.bar)',
        '              |   ',
        '              false',
    ]);
    
    test('CallExpression', function (transpiledCode) {
        var name = 'bar';
        var foo = function (n) { return false; };
        eval(transpiledCode);
    }, [
        'assert(foo(name))',
        '       |   |     ',
        '       |   "bar" ',
        '       false     ',
    ]);
    
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
