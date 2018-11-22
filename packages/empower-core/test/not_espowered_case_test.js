'use strict';

const empower = require('..');
const baseAssert = require('assert');

describe('not-espowered: ', () => {
  const assert = empower(baseAssert);

  it('argument is null Literal.', () => {
    const foo = 'foo';
    try {
      eval('assert.equal(foo, null);');
      assert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
      baseAssert(/^AssertionError/.test(e.name));
      baseAssert((e.message === '\'foo\' == null' || e.message === '\"foo\" == null'));
      baseAssert(e.powerAssertContext === undefined);
    }
  });

  it('empowered function also acts like an assert function', () => {
    const falsy = 0;
    try {
      eval('assert(falsy, "assertion message");');
      assert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
      baseAssert(/^AssertionError/.test(e.name));
      baseAssert.strictEqual(e.message, 'assertion message');
      baseAssert(e.powerAssertContext === undefined);
    }
  });

  describe('assertion method with one argument and optional message', () => {
    it('Identifier', () => {
      const falsy = 0;
      try {
        eval('assert.ok(falsy, "assertion message");');
        assert.ok(false, 'AssertionError should be thrown');
      } catch (e) {
        baseAssert(/^AssertionError/.test(e.name));
        baseAssert.strictEqual(e.message, 'assertion message');
        baseAssert(e.powerAssertContext === undefined);
      }
    });
  });

  describe('assertion method with two arguments', () => {
    it('both Identifier', () => {
      const foo = 'foo';
      const bar = 'bar';
      try {
        eval('assert.equal(foo, bar);');
        assert.ok(false, 'AssertionError should be thrown');
      } catch (e) {
        baseAssert(/^AssertionError/.test(e.name));
        baseAssert((e.message === '\'foo\' == \'bar\'' || e.message === '\"foo\" == \"bar\"'));
        baseAssert(e.powerAssertContext === undefined);
      }
    });

    it('first argument is Literal', () => {
      const bar = 'bar';
      try {
        eval('assert.equal("foo", bar);');
        assert.ok(false, 'AssertionError should be thrown');
      } catch (e) {
        baseAssert(/^AssertionError/.test(e.name));
        baseAssert((e.message === '\'foo\' == \'bar\'' || e.message === '\"foo\" == \"bar\"'));
        baseAssert(e.powerAssertContext === undefined);
      }
    });

    it('second argument is Literal', () => {
      const foo = 'foo';
      try {
        eval('assert.equal(foo, "bar");');
        assert.ok(false, 'AssertionError should be thrown');
      } catch (e) {
        baseAssert(/^AssertionError/.test(e.name));
        baseAssert((e.message === '\'foo\' == \'bar\'' || e.message === '\"foo\" == \"bar\"'));
        baseAssert(e.powerAssertContext === undefined);
      }
    });
  });
});
