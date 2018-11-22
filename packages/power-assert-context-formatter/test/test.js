'use strict';

delete require.cache[require.resolve('..')];
const createFormatter = require('..');
const AstReducer = require('power-assert-context-reducer-ast');
const AssertionRenderer = require('power-assert-renderer-assertion');
const DiagramRenderer = require('power-assert-renderer-diagram');
const baseAssert = require('assert');
const assert = require('../../../test_helper/empowered-assert');
const transpile = require('../../../test_helper/transpile');
const appendAst = require('power-assert-context-reducer-ast');

describe('power-assert-context-formatter : pipeline option', () => {
  it('bare constructors, without options', () => {
    const format = createFormatter({
      pipeline: [
        AstReducer,
        AssertionRenderer,
        DiagramRenderer
      ]
    });
    try {
      const foo = { name: 'foo', items: ['one', 'two'] };
      const bar = { name: 'bar', items: ['toto', 'tata'] };
      eval(transpile('assert.deepEqual(foo, bar)'));
    } catch (e) {
      const result = format(e.powerAssertContext);
      baseAssert.strictEqual(result, [
        '  ',
        '  assert.deepEqual(foo, bar)',
        '                   |    |   ',
        '                   |    Object{name:"bar",items:["toto","tata"]}',
        '                   Object{name:"foo",items:["one","two"]}',
        '  '
      ].join('\n'));
    }
  });

  it('constructors with options', () => {
    const format = createFormatter({
      pipeline: [
        { ctor: AstReducer },
        { ctor: AssertionRenderer },
        { ctor: DiagramRenderer, options: { maxDepth: 2 } }
      ]
    });
    try {
      const foo = { name: 'foo', items: ['one', 'two'] };
      const bar = { name: 'bar', items: ['toto', 'tata'] };
      eval(transpile('assert.deepEqual(foo, bar)'));
    } catch (e) {
      const result = format(e.powerAssertContext);
      baseAssert.strictEqual(result, [
        '  ',
        '  assert.deepEqual(foo, bar)',
        '                   |    |   ',
        '                   |    Object{name:"bar",items:["toto","tata"]}',
        '                   Object{name:"foo",items:["one","two"]}',
        '  '
      ].join('\n'));
    }
  });

  it('append ast reducer', () => {
    const format = createFormatter({
      pipeline: [
        AstReducer,
        AssertionRenderer,
        DiagramRenderer
      ]
    });
    try {
      const foo = { name: 'foo', items: ['one', 'two'] };
      const bar = { name: 'bar', items: ['toto', 'tata'] };
      eval(transpile('assert.deepEqual(foo, bar)', false));
    } catch (e) {
      baseAssert(e.powerAssertContext.source !== undefined);
      baseAssert(e.powerAssertContext.source.ast === undefined);
      baseAssert(e.powerAssertContext.source.tokens === undefined);
      baseAssert(e.powerAssertContext.source.visitorKeys === undefined);
      const result = format(e.powerAssertContext);
      baseAssert(e.powerAssertContext.source.ast !== undefined);
      baseAssert(e.powerAssertContext.source.tokens !== undefined);
      baseAssert(e.powerAssertContext.source.visitorKeys !== undefined);
      baseAssert.strictEqual(result, [
        '  ',
        '  assert.deepEqual(foo, bar)',
        '                   |    |   ',
        '                   |    Object{name:"bar",items:["toto","tata"]}',
        '                   Object{name:"foo",items:["one","two"]}',
        '  '
      ].join('\n'));
    }
  });

  it('degrade gracefully when there are some parse errors caused by not supported syntax', () => {
    const format = createFormatter({
      pipeline: [
        AstReducer,
        AssertionRenderer,
        DiagramRenderer
      ]
    });
    function validate (name) {
      return {
        name: name,
        valid: true,
        value: this
      };
    }
    try {
      eval(transpile('assert.deepEqual(true::validate("foo"), { valid: true, value: true, name: "bar" })', false));
    } catch (e) {
      const result = format(e.powerAssertContext);
      baseAssert.strictEqual(result, [
        '  ',
        '  assert.deepEqual(true::validate("foo"), { valid: true, value: true, name: "bar" })',
        '                       ?                                                            ',
        '                       ?                                                            ',
        '                       SyntaxError: Unexpected token (1:21)                         ',
        '                                                                                    ',
        '  If you are using `babel-plugin-espower` and want to use experimental syntax in your assert(), you should set `embedAst` option to true.',
        '  see: https://github.com/power-assert-js/babel-plugin-espower#optionsembedast      ',
        '                                                                                    ',
        '                                                                                    ',
        '  '
      ].join('\n'));
    }
  });
});

describe('power-assert-context-formatter : outputOffset option', () => {
  it('default is 2', () => {
    const format = createFormatter({
      pipeline: [
        AstReducer,
        AssertionRenderer
      ]
    });
    try {
      const foo = 'foo';
      const bar = 'bar';
      eval(transpile('assert(foo === bar)'));
    } catch (e) {
      const result = format(e.powerAssertContext);
      baseAssert.strictEqual(result, [
        '  ',
        '  assert(foo === bar)',
        '  '
      ].join('\n'));
    }
  });

  it('when 0', () => {
    const format = createFormatter({
      outputOffset: 0,
      pipeline: [
        AstReducer,
        AssertionRenderer
      ]
    });
    try {
      const foo = 'foo';
      const bar = 'bar';
      eval(transpile('assert(foo === bar)'));
    } catch (e) {
      const result = format(e.powerAssertContext);
      baseAssert.strictEqual(result, [
        '',
        'assert(foo === bar)',
        ''
      ].join('\n'));
    }
  });
});

describe('power-assert-context-formatter : lineSeparator option', () => {
  function lineSeparatorTest (name, option, expectedSeparator) {
    it(name, () => {
      const format = createFormatter(Object.assign({
        outputOffset: 0,
        pipeline: [
          AstReducer,
          AssertionRenderer
        ]
      }, option));
      try {
        const foo = 'foo';
        eval(transpile('assert(foo === "bar")'));
      } catch (e) {
        const result = format(e.powerAssertContext);
        baseAssert.strictEqual(result, [
          '',
          'assert(foo === "bar")',
          ''
        ].join(expectedSeparator));
        baseAssert(/^AssertionError/.test(e.name));
      }
    });
  }
  lineSeparatorTest('default is LF', {}, '\n');
  lineSeparatorTest('LF', { lineSeparator: '\n' }, '\n');
  lineSeparatorTest('CR', { lineSeparator: '\r' }, '\r');
  lineSeparatorTest('CRLF', { lineSeparator: '\r\n' }, '\r\n');
});
