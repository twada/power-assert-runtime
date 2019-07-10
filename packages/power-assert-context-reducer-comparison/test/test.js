'use strict';

delete require.cache[require.resolve('..')];
const ComparisonReducer = require('..');
const AstReducer = require('power-assert-context-reducer-ast');
const createFormatter = require('power-assert-context-formatter');
const baseAssert = require('assert');
const assert = require('../../../test_helper/empowered-assert');
const transpile = require('../../../test_helper/transpile');

describe('ComparisonReducer', () => {
  it('add `expected`, `actual` and `operator` to powerAssertContext', () => {
    const format = createFormatter({
      pipeline: [
        AstReducer,
        ComparisonReducer
      ]
    });
    try {
      const foo = 'FOO';
      const bar = 'BAR';
      eval(transpile('assert(foo === bar)'));
    } catch (e) {
      baseAssert(e.powerAssertContext.expected === undefined);
      baseAssert(e.powerAssertContext.actual === undefined);
      baseAssert(e.powerAssertContext.operator === undefined);
      format(e.powerAssertContext);
      baseAssert(e.powerAssertContext.expected === 'BAR');
      baseAssert(e.powerAssertContext.actual === 'FOO');
      baseAssert(e.powerAssertContext.operator === '===');
    }
  });

  it('affects only for top-level BinaryExpression', () => {
    const format = createFormatter({
      pipeline: [
        AstReducer,
        ComparisonReducer
      ]
    });
    try {
      const foo = 'FOO';
      const bar = 'BAR';
      eval(transpile('assert(!(foo === bar))'));
    } catch (e) {
      baseAssert(e.powerAssertContext.expected === undefined);
      baseAssert(e.powerAssertContext.actual === undefined);
      baseAssert(e.powerAssertContext.operator === undefined);
      format(e.powerAssertContext);
      baseAssert(e.powerAssertContext.expected === undefined);
      baseAssert(e.powerAssertContext.actual === undefined);
      baseAssert(e.powerAssertContext.operator === undefined);
    }
  });
});
