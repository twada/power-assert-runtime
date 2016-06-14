'use strict';

delete require.cache[require.resolve('..')];
var DiagramRenderer = require('..');
var createRendererTester = require('../../../test_helper/create-renderer-tester');
var test = createRendererTester(DiagramRenderer);
var assert = require('../../../test_helper/empowered-assert');

describe('DiagramRenderer', function () {

    describe('Identifier', function () {
        test('boolean', function (transpiledCode) {
            var truthy = false;
            eval(transpiledCode);
        }, [
            'assert(truthy)',
            '       |      ',
            '       false  ',
        ]);

        test('empty string', function (transpiledCode) {
            var truthy = '';
            eval(transpiledCode);
        }, [
            'assert(truthy)',
            '       |      ',
            '       ""     ',
        ]);

        test('zero', function (transpiledCode) {
            var truthy = 0;
            eval(transpiledCode);
        }, [
            'assert(truthy)',
            '       |      ',
            '       0      ',
        ]);

        test('undefined', function (transpiledCode) {
            var truthy = undefined;
            eval(transpiledCode);
        }, [
            'assert(truthy)',
            '       |      ',
            '       undefined',
        ]);
    });


    describe('UnaryExpression', function () {
        test('with NumberLiteral', function (transpiledCode) {
            var num = 1;
            eval(transpiledCode);
        }, [
            'assert(-0)',
            '       |  ',
            '       0  '
        ]);

        test('with NumberLiteral and BinaryExpression', function (transpiledCode) {
            var num = 1;
            eval(transpiledCode);
        }, [
            'assert(4 === -4)',
            '         |   |  ',
            '         |   -4 ',
            '         false  '
        ]);

        test('with Identifier and BinaryExpression', function (transpiledCode) {
            var num = 1;
            eval(transpiledCode);
        }, [
            'assert(+num === -num)',
            '       ||   |   ||   ',
            '       ||   |   |1   ',
            '       ||   |   -1   ',
            '       |1   false    ',
            '       1             '
        ]);

        test('negation', function (transpiledCode) {
            var truth = true;
            eval(transpiledCode);
        }, [
            'assert(!truth)',
            '       ||     ',
            '       |true  ',
            '       false  '
        ]);

        test('double negation', function (transpiledCode) {
            var some = '';
            eval(transpiledCode);
        }, [
            'assert(!!some)',
            '       |||    ',
            '       ||""   ',
            '       |true  ',
            '       false  '
        ]);

        test('typeof operator', function (transpiledCode) {
            eval(transpiledCode);
        }, [
            'assert(typeof foo !== "undefined")',
            '       |          |               ',
            '       |          false           ',
            '       "undefined"                '
        ]);

        test('delete operator', function (transpiledCode) {
            var foo = {
                bar: {
                    baz: false
                }
            };
            eval(transpiledCode);
        }, [
            'assert(delete foo.bar === false)',
            '       |      |   |   |         ',
            '       |      |   |   false     ',
            '       |      |   Object{baz:false}',
            '       true   Object{bar:Object{baz:false}}',
        ]);
    });


    describe('MemberExpression', function () {
        test('computed: false', function (transpiledCode) {
            var en = { foo: false };
            eval(transpiledCode);
        }, [
            'assert(en.foo)',
            '       |  |   ',
            '       |  false',
            '       Object{foo:false}'
        ]);
        
        test('computed: false', function (transpiledCode) {
            var propName = 'foo';
            var en = { foo: false };
            eval(transpiledCode);
        }, [
            'assert(en[propName])',
            '       | ||         ',
            '       | |"foo"     ',
            '       | false      ',
            '       Object{foo:false}'
        ]);
        
        test('chained member', function (transpiledCode) {
            var en = { foo: { bar: false } };
            eval(transpiledCode);
        }, [
            'assert(en.foo.bar)',
            '       |  |   |   ',
            '       |  |   false',
            '       |  Object{bar:false}',
            '       Object{foo:Object{bar:false}}'
        ]);
        
        test('undefined property', function (transpiledCode) {
            eval(transpiledCode);
        }, [
            'assert({}.hoge === "xxx")',
            '       |  |    |         ',
            '       |  |    false     ',
            '       |  undefined      ',
            '       Object{}          '
        ]);
    });


    describe('CallExpression', function () {
        test('arguments', function (transpiledCode) {
            var name = 'bar';
            var age = 23;
            var foo = function (n, a) { return false; };
            eval(transpiledCode);
        }, [
            'assert(foo(name, age))',
            '       |   |     |    ',
            '       |   "bar" 23   ',
            '       false          '
        ]);
        
        test('deep CallExpression', function (transpiledCode) {
            var bar = function () { return 'baz'; };
            var en = { foo: function (n) { return false; } };
            eval(transpiledCode);
        }, [
            'assert(en.foo(bar()))',
            '       |  |   |      ',
            '       |  |   "baz"  ',
            '       |  false      ',
            '       Object{foo:#function#}'
        ]);
    });
    

    describe('BinaryExpression', function () {
        test('of BinaryExpression', function (transpiledCode) {
            var foo = 'foo';
            var bar = 'bar';
            eval(transpiledCode);
        }, [
            'assert(foo === bar === (foo === bar) === (foo === bar))',
            '       |   |   |   |    |   |   |    |    |   |   |    ',
            '       |   |   |   |    |   |   |    |    |   |   "bar"',
            '       |   |   |   |    |   |   |    |    |   false    ',
            '       |   |   |   |    |   |   |    |    "foo"        ',
            '       |   |   |   |    |   |   |    false             ',
            '       |   |   |   |    |   |   "bar"                  ',
            '       |   |   |   |    |   false                      ',
            '       |   |   |   true "foo"                          ',
            '       |   |   "bar"                                   ',
            '       |   false                                       ',
            '       "foo"                                           '
        ]);

        test('of Identifier', function (transpiledCode) {
            var foo = 'foo';
            var bar = 'bar';
            eval(transpiledCode);
        }, [
            'assert(foo === bar)',
            '       |   |   |   ',
            '       |   |   "bar"',
            '       |   false   ',
            '       "foo"       ',
        ]);
        
        test('of Identifier and StringLiteral', function (transpiledCode) {
            var foo = 'foo';
            eval(transpiledCode);
        }, [
            'assert(foo === "bar")',
            '       |   |         ',
            '       |   false     ',
            '       "foo"         ',
        ]);

        test('of StringLiteral', function (transpiledCode) {
            eval(transpiledCode);
        }, [
            'assert("foo" === "bar")',
            '             |         ',
            '             false     '
        ]);

        test('of NumberLiteral', function (transpiledCode) {
            eval(transpiledCode);
        }, [
            'assert(4 !== 4)',
            '         |     ',
            '         false '
        ]);

        test('of MemberExpression', function (transpiledCode) {
            var en = { foo: 'bar', toto: 'tata' };
            var fr = { toto: 'tata'};
            eval(transpiledCode);
        }, [
            'assert(en.foo === fr.toto)',
            '       |  |   |   |  |    ',
            '       |  |   |   |  "tata"',
            '       |  |   |   Object{toto:"tata"}',
            '       |  |   false       ',
            '       |  "bar"           ',
            '       Object{foo:"bar",toto:"tata"}'
        ]);

        test('of CallExpression', function (transpiledCode) {
            var en = { foo: function() { return 'bar';} };
            var fr = { toto: function() { return 'tata'; } };
            eval(transpiledCode);
        }, [
            'assert(en.foo() === fr.toto())',
            '       |  |     |   |  |      ',
            '       |  |     |   |  "tata" ',
            '       |  |     |   Object{toto:#function#}',
            '       |  "bar" false         ',
            '       Object{foo:#function#} '
        ]);

        test('non-Punctuator BinaryExpression operator', function (transpiledCode) {
            function Person (name) { this.name = name; };
            var foo = 'bob';
            eval(transpiledCode);
        }, [
            'assert(foo instanceof Person)',
            '       |   |          |      ',
            '       |   false      #function#',
            '       "bob"                 '
        ]);

        test('Loose equality', function (transpiledCode) {
            var truthy = '1';
            var falsy = false;
            eval(transpiledCode);
        }, [
            'assert(truthy == falsy)',
            '       |      |  |     ',
            '       |      |  false ',
            '       "1"    false    '
        ]);

        test('of NaN', function (transpiledCode) {
            var nan1 = NaN;
            var nan2 = NaN;
            eval(transpiledCode);
        }, [
            'assert(nan1 === nan2)',
            '       |    |   |    ',
            '       |    |   NaN  ',
            '       NaN  false    '
        ]);

        test('of Infinity', function (transpiledCode) {
            var positiveInfinity = Infinity;
            var negativeInfinity = -Infinity;
            eval(transpiledCode);
        }, [
            'assert(positiveInfinity === negativeInfinity)',
            '       |                |   |                ',
            '       |                |   -Infinity        ',
            '       Infinity         false                '
        ]);
    });


    describe('LogicalExpression', function () {
        test('of Identifiers', function (transpiledCode) {
            var x = false;
            var y = 0;
            var z = null;
            eval(transpiledCode);
        }, [
            'assert(x || y || z)',
            '       | |  | |  | ',
            '       | |  | |  null',
            '       | 0  0 null ',
            '       false       '
        ]);

        test('of Identifier evaluation order', function (transpiledCode) {
            var x = 'yeah';
            var y = 0;
            var z = true;
            eval(transpiledCode);
        }, [
            'assert(x && y && z)',
            '       | |  | |    ',
            '       | 0  0 0    ',
            '       "yeah"      '
        ]);

        test('of CallExpression and MemberExpression', function (transpiledCode) {
            var x = { foo: function(n) { return false; } };
            var y = function(n) { return null; };
            var z = { val: 0 };
            eval(transpiledCode);
        }, [
            'assert(x.foo() || y() || z.val)',
            '       | |     |  |   |  | |   ',
            '       | |     |  |   |  | 0   ',
            '       | |     |  |   0  Object{val:0}',
            '       | |     |  null         ',
            '       | false null            ',
            '       Object{foo:#function#}  '
        ]);
    });


    test('ArrayExpression as an argument of CallExpression', function (transpiledCode) {
        var pop = function (ary) { return ary.pop(); };
        var zero = 0;
        var one = 1;
        var two = 2;
        eval(transpiledCode);
    }, [
        'assert(pop([zero, one, two]) === one)',
        '       |   ||     |    |     |   |   ',
        '       |   ||     |    |     |   1   ',
        '       |   |0     1    2     false   ',
        '       2   [0,1]                     '
    ]);


    test('ObjectExpression', function (transpiledCode) {
        eval(transpiledCode);
    }, [
        'assert.deepEqual({ foo: 0 }, { foo: 1 })',
        '                 |           |          ',
        '                 |           Object{foo:1}',
        '                 Object{foo:0}          '
    ]);


    describe('ObjectRestSpread', function () {
        test('Spread Properties', function (transpiledCode) {
            var a = 'a';
            var b = 'b';
            var obj = { foo: 'FOO', bar: 'BAR' };
            eval(transpiledCode);
        }, [
            'assert.deepEqual({ b, ...obj }, { a, ...obj })',
            '                 |              |             ',
            '                 |              Object{a:"a",foo:"FOO",bar:"BAR"}',
            '                 Object{b:"b",foo:"FOO",bar:"BAR"}'
        ]);
    });


    describe('Function Bind Syntax', function () {
        test('avajs/ava#881', function (transpiledCode) {
            function validate(name) {
                return {
                    name: name,
                    valid: true,
                    value: this
                };
            }
            eval(transpiledCode);
        }, [
            'assert.deepEqual(true::validate("foo"), { valid: true, value: true, name: "bar" })',
            '                 |                      |                                         ',
            '                 |                      Object{valid:true,value:true,name:"bar"}  ',
            '                 Object{name:"foo",valid:true,value:true}                         '
        ]);
    });

});
