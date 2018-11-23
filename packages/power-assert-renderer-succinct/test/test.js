'use strict';

delete require.cache[require.resolve('..')];
const SuccinctRenderer = require('..');
const createRendererTester = require('../../../test_helper/create-renderer-tester');
const test = createRendererTester(SuccinctRenderer);
const assert = require('../../../test_helper/empowered-assert');

describe('SuccinctRenderer', () => {
  test('MemberExpression, BinaryExpression and StringLiteral', (transpiledCode) => {
    const a = { name: 'foo' };
    eval(transpiledCode);
  }, [
    'assert(a.name === "bar")',
    '         |              ',
    '         "foo"          '
  ]);

  test('Identifier', (transpiledCode) => {
    const truthy = false;
    eval(transpiledCode);
  }, [
    'assert(truthy)',
    '       |      ',
    '       false  '
  ]);

  test('MemberExpression', (transpiledCode) => {
    const en = { foo: false };
    eval(transpiledCode);
  }, [
    'assert(en.foo)',
    '          |   ',
    '          false'
  ]);

  test('deep MemberExpression', (transpiledCode) => {
    const en = { foo: { bar: false } };
    eval(transpiledCode);
  }, [
    'assert(en.foo.bar)',
    '              |   ',
    '              false'
  ]);

  test('CallExpression', (transpiledCode) => {
    const name = 'bar';
    const foo = (n) => false;
    eval(transpiledCode);
  }, [
    'assert(foo(name))',
    '       |   |     ',
    '       |   "bar" ',
    '       false     '
  ]);

  test('deep CallExpression', (transpiledCode) => {
    const bar = () => 'baz';
    const en = { foo (n) { return false; } };
    eval(transpiledCode);
  }, [
    'assert(en.foo(bar()))',
    '          |   |      ',
    '          |   "baz"  ',
    '          false      '
  ]);

  test('BinaryExpression of Identifier', (transpiledCode) => {
    const foo = 'foo';
    const bar = 'bar';
    eval(transpiledCode);
  }, [
    'assert(foo === bar)',
    '       |       |   ',
    '       "foo"   "bar"'
  ]);

  test('BinaryExpression of Identifier and StringLiteral', (transpiledCode) => {
    const foo = 'foo';
    eval(transpiledCode);
  }, [
    'assert(foo === "bar")',
    '       |             ',
    '       "foo"         '
  ]);

  test('BinaryExpression of StringLiteral', (transpiledCode) => {
    eval(transpiledCode);
  }, [
    'assert("foo" === "bar")',
    '                       ',
    '                       '
  ]);

  test('BinaryExpression of MemberExpression', (transpiledCode) => {
    const en = { foo: 'bar', toto: 'tata' };
    const fr = { toto: 'tata' };
    eval(transpiledCode);
  }, [
    'assert(en.foo === fr.toto)',
    '          |          |    ',
    '          "bar"      "tata"'
  ]);

  test('BinaryExpression of CallExpression', (transpiledCode) => {
    const en = { foo () { return 'bar'; } };
    const fr = { toto () { return 'tata'; } };
    eval(transpiledCode);
  }, [
    'assert(en.foo() === fr.toto())',
    '          |            |      ',
    '          "bar"        "tata" '
  ]);

  test('non-Punctuator BinaryExpression operator', (transpiledCode) => {
    function Person (name) { this.name = name; }
    const foo = 'bob';
    eval(transpiledCode);
  }, [
    'assert(foo instanceof Person)',
    '       |              |      ',
    '       "bob"          #function#'
  ]);

  test('LogicalExpression of Identifiers', (transpiledCode) => {
    const x = false;
    const y = 0;
    const z = null;
    eval(transpiledCode);
  }, [
    'assert(x || y || z)',
    '       |    |    | ',
    '       |    0    null',
    '       false       '
  ]);

  test('LogicalExpression of Identifier evaluation order', (transpiledCode) => {
    const x = 'yeah';
    const y = 0;
    const z = true;
    eval(transpiledCode);
  }, [
    'assert(x && y && z)',
    '       |    |      ',
    '       |    0      ',
    '       "yeah"      '
  ]);

  test('LogicalExpression of CallExpression and MemberExpression', (transpiledCode) => {
    const x = { foo (n) { return false; } };
    const y = (n) => null;
    const z = { val: 0 };
    eval(transpiledCode);
  }, [
    'assert(x.foo() || y() || z.val)',
    '         |        |        |   ',
    '         false    null     0   '
  ]);

  test('ArrayExpression as an argument of CallExpression', (transpiledCode) => {
    const pop = (ary) => ary.pop();
    const zero = 0;
    const one = 1;
    const two = 2;
    eval(transpiledCode);
  }, [
    'assert(pop([zero, one, two]) === one)',
    '       |    |     |    |         |   ',
    '       2    0     1    2         1   '
  ]);
});
