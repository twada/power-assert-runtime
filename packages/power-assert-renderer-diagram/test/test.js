'use strict';

delete require.cache[require.resolve('..')];
const DiagramRenderer = require('..');
const createRendererTester = require('../../../test_helper/create-renderer-tester');
const test = createRendererTester(DiagramRenderer);
const assert = require('../../../test_helper/empowered-assert');

describe('DiagramRenderer', () => {
  describe('Identifier', () => {
    test('boolean', (transpiledCode) => {
      const truthy = false;
      eval(transpiledCode);
    }, [
      'assert(truthy)',
      '       |      ',
      '       false  '
    ]);

    test('empty string', (transpiledCode) => {
      const truthy = '';
      eval(transpiledCode);
    }, [
      'assert(truthy)',
      '       |      ',
      '       ""     '
    ]);

    test('zero', (transpiledCode) => {
      const truthy = 0;
      eval(transpiledCode);
    }, [
      'assert(truthy)',
      '       |      ',
      '       0      '
    ]);

    test('undefined', (transpiledCode) => {
      const truthy = undefined;
      eval(transpiledCode);
    }, [
      'assert(truthy)',
      '       |      ',
      '       undefined'
    ]);
  });

  describe('UnaryExpression', () => {
    test('with NumberLiteral', (transpiledCode) => {
      const num = 1;
      eval(transpiledCode);
    }, [
      'assert(-0)',
      '       |  ',
      '       0  '
    ]);

    test('with NumberLiteral and BinaryExpression', (transpiledCode) => {
      const num = 1;
      eval(transpiledCode);
    }, [
      'assert(4 === -4)',
      '         |   |  ',
      '         |   -4 ',
      '         false  '
    ]);

    test('with Identifier and BinaryExpression', (transpiledCode) => {
      const num = 1;
      eval(transpiledCode);
    }, [
      'assert(+num === -num)',
      '       ||   |   ||   ',
      '       ||   |   |1   ',
      '       ||   |   -1   ',
      '       |1   false    ',
      '       1             '
    ]);

    test('negation', (transpiledCode) => {
      const truth = true;
      eval(transpiledCode);
    }, [
      'assert(!truth)',
      '       ||     ',
      '       |true  ',
      '       false  '
    ]);

    test('double negation', (transpiledCode) => {
      const some = '';
      eval(transpiledCode);
    }, [
      'assert(!!some)',
      '       |||    ',
      '       ||""   ',
      '       |true  ',
      '       false  '
    ]);

    test('typeof operator', (transpiledCode) => {
      eval(transpiledCode);
    }, [
      'assert(typeof foo !== "undefined")',
      '       |          |               ',
      '       |          false           ',
      '       "undefined"                '
    ]);

    test('delete operator', (transpiledCode) => {
      const foo = {
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
      '       true   Object{bar:Object{baz:false}}'
    ]);
  });

  describe('MemberExpression', () => {
    test('computed: false', (transpiledCode) => {
      const en = { foo: false };
      eval(transpiledCode);
    }, [
      'assert(en.foo)',
      '       |  |   ',
      '       |  false',
      '       Object{foo:false}'
    ]);

    test('computed: false', (transpiledCode) => {
      const propName = 'foo';
      const en = { foo: false };
      eval(transpiledCode);
    }, [
      'assert(en[propName])',
      '       | ||         ',
      '       | |"foo"     ',
      '       | false      ',
      '       Object{foo:false}'
    ]);

    test('chained member', (transpiledCode) => {
      const en = { foo: { bar: false } };
      eval(transpiledCode);
    }, [
      'assert(en.foo.bar)',
      '       |  |   |   ',
      '       |  |   false',
      '       |  Object{bar:false}',
      '       Object{foo:Object{bar:false}}'
    ]);

    test('undefined property', (transpiledCode) => {
      eval(transpiledCode);
    }, [
      'assert({}.hoge === "xxx")',
      '       |  |    |         ',
      '       |  |    false     ',
      '       |  undefined      ',
      '       Object{}          '
    ]);
  });

  describe('CallExpression', () => {
    test('arguments', (transpiledCode) => {
      const name = 'bar';
      const age = 23;
      const foo = (n, a) => false;
      eval(transpiledCode);
    }, [
      'assert(foo(name, age))',
      '       |   |     |    ',
      '       |   "bar" 23   ',
      '       false          '
    ]);

    test('deep CallExpression', (transpiledCode) => {
      const bar = () => 'baz';
      const en = { foo (n) { return false; } };
      eval(transpiledCode);
    }, [
      'assert(en.foo(bar()))',
      '       |  |   |      ',
      '       |  |   "baz"  ',
      '       |  false      ',
      '       Object{foo:#function#}'
    ]);
  });

  describe('BinaryExpression', () => {
    test('of BinaryExpression', (transpiledCode) => {
      const foo = 'foo';
      const bar = 'bar';
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

    test('of Identifier', (transpiledCode) => {
      const foo = 'foo';
      const bar = 'bar';
      eval(transpiledCode);
    }, [
      'assert(foo === bar)',
      '       |   |   |   ',
      '       |   |   "bar"',
      '       |   false   ',
      '       "foo"       '
    ]);

    test('of Identifier and StringLiteral', (transpiledCode) => {
      const foo = 'foo';
      eval(transpiledCode);
    }, [
      'assert(foo === "bar")',
      '       |   |         ',
      '       |   false     ',
      '       "foo"         '
    ]);

    test('of StringLiteral', (transpiledCode) => {
      eval(transpiledCode);
    }, [
      'assert("foo" === "bar")',
      '             |         ',
      '             false     '
    ]);

    test('of NumberLiteral', (transpiledCode) => {
      eval(transpiledCode);
    }, [
      'assert(4 !== 4)',
      '         |     ',
      '         false '
    ]);

    test('of MemberExpression', (transpiledCode) => {
      const en = { foo: 'bar', toto: 'tata' };
      const fr = { toto: 'tata' };
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

    test('of CallExpression', (transpiledCode) => {
      const en = { foo () { return 'bar'; } };
      const fr = { toto () { return 'tata'; } };
      eval(transpiledCode);
    }, [
      'assert(en.foo() === fr.toto())',
      '       |  |     |   |  |      ',
      '       |  |     |   |  "tata" ',
      '       |  |     |   Object{toto:#function#}',
      '       |  "bar" false         ',
      '       Object{foo:#function#} '
    ]);

    test('non-Punctuator BinaryExpression operator', (transpiledCode) => {
      function Person (name) { this.name = name; }
      const foo = 'bob';
      eval(transpiledCode);
    }, [
      'assert(foo instanceof Person)',
      '       |   |          |      ',
      '       |   false      #function#',
      '       "bob"                 '
    ]);

    test('Loose equality', (transpiledCode) => {
      const truthy = '1';
      const falsy = false;
      eval(transpiledCode);
    }, [
      'assert(truthy == falsy)',
      '       |      |  |     ',
      '       |      |  false ',
      '       "1"    false    '
    ]);

    test('of NaN', (transpiledCode) => {
      const nan1 = NaN;
      const nan2 = NaN;
      eval(transpiledCode);
    }, [
      'assert(nan1 === nan2)',
      '       |    |   |    ',
      '       |    |   NaN  ',
      '       NaN  false    '
    ]);

    test('of Infinity', (transpiledCode) => {
      const positiveInfinity = Infinity;
      const negativeInfinity = -Infinity;
      eval(transpiledCode);
    }, [
      'assert(positiveInfinity === negativeInfinity)',
      '       |                |   |                ',
      '       |                |   -Infinity        ',
      '       Infinity         false                '
    ]);
  });

  describe('LogicalExpression', () => {
    test('of Identifiers', (transpiledCode) => {
      const x = false;
      const y = 0;
      const z = null;
      eval(transpiledCode);
    }, [
      'assert(x || y || z)',
      '       | |  | |  | ',
      '       | |  | |  null',
      '       | 0  0 null ',
      '       false       '
    ]);

    test('of Identifier evaluation order', (transpiledCode) => {
      const x = 'yeah';
      const y = 0;
      const z = true;
      eval(transpiledCode);
    }, [
      'assert(x && y && z)',
      '       | |  | |    ',
      '       | 0  0 0    ',
      '       "yeah"      '
    ]);

    test('of CallExpression and MemberExpression', (transpiledCode) => {
      const x = { foo (n) { return false; } };
      const y = (n) => null;
      const z = { val: 0 };
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

  describe('ConditionalExpression', () => {
    test('of Identifiers, consequent', (transpiledCode) => {
      const foo = false;
      const bar = null;
      const baz = 0;
      eval(transpiledCode);
    }, [
      'assert(foo ? bar : baz)',
      '       |           |   ',
      '       false       0   '
    ]);
    test('of Identifiers, alternate', (transpiledCode) => {
      const foo = true;
      const bar = null;
      const baz = 0;
      eval(transpiledCode);
    }, [
      'assert(foo ? bar : baz)',
      '       |     |         ',
      '       true  null      '
    ]);
    test('of another ConditionalExpression', (transpiledCode) => {
      const falsy = null;
      const truthy = 'truth';
      const anotherFalsy = 0;
      eval(transpiledCode);
    }, [
      'assert(falsy ? truthy : truthy ? anotherFalsy : truthy)',
      '       |                |        |                     ',
      '       null             "truth"  0                     '
    ]);
  });

  describe('ObjectExpression', () => {
    test('of Literals', (transpiledCode) => {
      eval(transpiledCode);
    }, [
      'assert.deepEqual({ foo: 0 }, { foo: 1 })',
      '                 |           |          ',
      '                 |           Object{foo:1}',
      '                 Object{foo:0}          '
    ]);
    test('of Identifiers', (transpiledCode) => {
      const bar = 'BAR';
      const fuga = 'FUGA';
      eval(transpiledCode);
    }, [
      'assert.deepEqual({ foo: bar }, { hoge: fuga })',
      '                 |      |      |       |      ',
      '                 |      |      |       "FUGA" ',
      '                 |      "BAR"  Object{hoge:"FUGA"}',
      '                 Object{foo:"BAR"}            '
    ]);
    test('enhanced object literals', (transpiledCode) => {
      const name = 'bobby';
      eval(transpiledCode);
    }, [
      'assert.deepEqual({ name, [`greet from ${name}`]: `Hello, I am ${name}` }, null)',
      '                 |        |             |        |              |              ',
      '                 |        |             |        |              "bobby"        ',
      '                 |        |             "bobby"  "Hello, I am bobby"           ',
      '                 |        "greet from bobby"                                   ',
      '                 Object{name:"bobby","greet from bobby":"Hello, I am bobby"}   '
    ]);
  });

  test('ArrayExpression as an argument of CallExpression', (transpiledCode) => {
    const pop = (ary) => ary.pop();
    const zero = 0;
    const one = 1;
    const two = 2;
    eval(transpiledCode);
  }, [
    'assert(pop([zero, one, two]) === one)',
    '       |   ||     |    |     |   |   ',
    '       |   ||     |    |     |   1   ',
    '       |   |0     1    2     false   ',
    '       2   [0,1]                     '
  ]);

  describe('ObjectRestSpread', () => {
    test('Spread Properties', (transpiledCode) => {
      const a = 'a';
      const b = 'b';
      const obj = { foo: 'FOO', bar: 'BAR' };
      eval(transpiledCode);
    }, [
      'assert.deepEqual({ b, ...obj }, { a, ...obj })',
      '                 |       |      |       |     ',
      '                 |       |      |       Object{foo:"FOO",bar:"BAR"}',
      '                 |       |      Object{a:"a",foo:"FOO",bar:"BAR"}',
      '                 |       Object{foo:"FOO",bar:"BAR"}',
      '                 Object{b:"b",foo:"FOO",bar:"BAR"}'
    ]);
  });

  describe('Function Bind Syntax', () => {
    test('avajs/ava#881', (transpiledCode) => {
      function validate (name) {
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

  describe('SequenceExpression i.e., comma operator', () => {
    test('power-assert-js/power-assert#59', (transpiledCode) => {
      eval(transpiledCode);
    }, [
      'assert((-0, -1) + 1 === -0 + -1)',
      '        |   |   |   |   |  | |  ',
      '        |   |   |   |   |  | -1 ',
      '        |   |   |   |   0  -1   ',
      '        0   -1  0   false       '
    ]);
  });
});
