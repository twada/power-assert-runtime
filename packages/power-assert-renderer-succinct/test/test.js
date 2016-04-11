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
    
    test('deep CallExpression', function (transpiledCode) {
        var bar = function () { return 'baz'; };
        var en = { foo: function (n) { return false; } };
        eval(transpiledCode);
    }, [
        'assert(en.foo(bar()))',
        '          |   |      ',
        '          |   "baz"  ',
        '          false      '
    ]);
    
    test('BinaryExpression of Identifier', function (transpiledCode) {
        var foo = 'foo';
        var bar = 'bar';
        eval(transpiledCode);
    }, [
        'assert(foo === bar)',
        '       |       |   ',
        '       "foo"   "bar"',
    ]);
    
    test('BinaryExpression of Identifier and StringLiteral', function (transpiledCode) {
        var foo = 'foo';
        eval(transpiledCode);
    }, [
        'assert(foo === "bar")',
        '       |             ',
        '       "foo"         '
    ]);

    test('BinaryExpression of StringLiteral', function (transpiledCode) {
        eval(transpiledCode);
    }, [
        'assert("foo" === "bar")',
        '                       ',
        '                       '
    ]);

    test('BinaryExpression of MemberExpression', function (transpiledCode) {
        var en = { foo: 'bar', toto: 'tata' };
        var fr = { toto: 'tata'};
        eval(transpiledCode);
    }, [
        'assert(en.foo === fr.toto)',
        '          |          |    ',
        '          "bar"      "tata"'
    ]);

    test('BinaryExpression of CallExpression', function (transpiledCode) {
        var en = { foo: function() { return 'bar';} };
        var fr = { toto: function() { return 'tata'; } };
        eval(transpiledCode);
    }, [
        'assert(en.foo() === fr.toto())',
        '          |            |      ',
        '          "bar"        "tata" '
    ]);

    test('non-Punctuator BinaryExpression operator', function (transpiledCode) {
        function Person (name) { this.name = name; };
        var foo = 'bob';
        eval(transpiledCode);
    }, [
        'assert(foo instanceof Person)',
        '       |              |      ',
        '       "bob"          #function#'
    ]);

    test('LogicalExpression of Identifiers', function (transpiledCode) {
        var x = false;
        var y = 0;
        var z = null;
        eval(transpiledCode);
    }, [
        'assert(x || y || z)',
        '       |    |    | ',
        '       |    0    null',
        '       false       '
    ]);

    test('LogicalExpression of Identifier evaluation order', function (transpiledCode) {
        var x = 'yeah';
        var y = 0;
        var z = true;
        eval(transpiledCode);
    }, [
        'assert(x && y && z)',
        '       |    |      ',
        '       |    0      ',
        '       "yeah"      '
    ]);

    test('LogicalExpression of CallExpression and MemberExpression', function (transpiledCode) {
        var x = { foo: function(n) { return false; } };
        var y = function(n) { return null; };
        var z = { val: 0 };
        eval(transpiledCode);
    }, [
        'assert(x.foo() || y() || z.val)',
        '         |        |        |   ',
        '         false    null     0   '
    ]);

    test('ArrayExpression as an argument of CallExpression', function (transpiledCode) {
        var pop = function (ary) { return ary.pop(); };
        var zero = 0;
        var one = 1;
        var two = 2;
        eval(transpiledCode);
    }, [
        'assert(pop([zero, one, two]) === one)',
        '       |    |     |    |         |   ',
        '       2    0     1    2         1   '
    ]);

});
