'use strict';

delete require.cache[require.resolve('..')];
const ComparisonRenderer = require('..');
const createRendererTester = require('../../../test_helper/create-renderer-tester');
const test = createRendererTester(ComparisonRenderer);
const assert = require('../../../test_helper/empowered-assert');

describe('ComparisonRenderer', () => {
  test('BinaryExpression', (transpiledCode) => {
    const foo = 'foo';
    const bar = 'bar';
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

  test('StringLiteral', (transpiledCode) => {
    const foo = 'foo';
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

  test('mutiline diff', (transpiledCode) => {
    const foo = 'foo\nbar';
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
