'use strict';

delete require.cache[require.resolve('..')];
const AssertionRenderer = require('..');
const assert = require('../../../test_helper/empowered-assert');
const transpile = require('../../../test_helper/transpile');
const testRendering = require('../../../test_helper/test-rendering');
const AstReducer = require('power-assert-context-reducer-ast');

describe('AssertionRenderer', () => {
  it('assert(foo === bar)', () => {
    const foo = 'foo';
    const bar = 'bar';
    testRendering(() => {
      eval(transpile('assert(foo === bar)'));
    }, [
      '',
      'assert(foo === bar)'
    ], { pipeline: [AstReducer, AssertionRenderer] });
  });

  it('show syntax error when there are some parse errors caused by not supported syntax', () => {
    function validate (name) {
      return {
        name: name,
        valid: true,
        value: this
      };
    }
    testRendering(() => {
      eval(transpile('assert.deepEqual(true::validate("foo"), { valid: true, value: true, name: "bar" })', false));
    }, [
      '',
      'assert.deepEqual(true::validate("foo"), { valid: true, value: true, name: "bar" })',
      '                     ?                                                            ',
      '                     ?                                                            ',
      '                     SyntaxError: Unexpected token (1:21)                         ',
      '                                                                                  ',
      'If you are using `babel-plugin-espower` and want to use experimental syntax in your assert(), you should set `embedAst` option to true.',
      'see: https://github.com/power-assert-js/babel-plugin-espower#optionsembedast      '
    ], {
      pipeline: [AstReducer, AssertionRenderer]
    });
  });
});
