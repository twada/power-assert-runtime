'use strict';

const empower = require('..');
const espower = require('espower');
const acorn = require('acorn');
const acornEs7Plugin = require('acorn-es7-plugin');
acornEs7Plugin(acorn);
const escodegen = require('escodegen');
const baseAssert = require('assert');

const slice = Array.prototype.slice;

const weave = (line, patterns) => {
  const filepath = '/absolute/path/to/project/test/some_test.js';
  const espowerOptions = {
    source: line,
    path: filepath,
    sourceRoot: '/absolute/path/to/project/',
    destructive: true
  };
  if (patterns) {
    espowerOptions.patterns = patterns;
  }
  const jsAST = acorn.parse(line, { ecmaVersion: 2018, locations: true, sourceType: 'module', sourceFile: filepath, plugins: { asyncawait: true } });
  const espoweredAST = espower(jsAST, espowerOptions);
  return escodegen.generate(espoweredAST, { format: { compact: true } });
};

const isAsyncAwaitSupported = (() => {
  try {
    eval('async function a() { await b(); }');
    return true;
  } catch (e) {
    if (e instanceof SyntaxError) return false;
    throw e;
  }
})();

it('default options behavior', () => {
  const assert = empower(baseAssert);

  const falsy = 0;
  try {
    eval(weave('assert(falsy);'));
    baseAssert.ok(false, 'AssertionError should be thrown');
  } catch (e) {
    baseAssert.deepStrictEqual(e.powerAssertContext, {
      'source': {
        'content': 'assert(falsy)',
        'filepath': 'test/some_test.js',
        'line': 1
      },
      'args': [
        {
          'value': 0,
          'events': [
            { 'value': 0, 'espath': 'arguments/0' }
          ]
        }
      ]
    });
    baseAssert(/^AssertionError/.test(e.name));
  }
});

describe('default options: ', () => {
  const assert = empower(baseAssert);

  it('Bug reproduction. should not fail if argument is null Literal.', () => {
    const foo = 'foo';
    try {
      eval(weave('assert.equal(foo, null);'));
      baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
      baseAssert.deepStrictEqual(e.powerAssertContext, {
        'source': {
          'content': 'assert.equal(foo, null)',
          'filepath': 'test/some_test.js',
          'line': 1
        },
        'args': [
          {
            'value': 'foo',
            'events': [{ 'value': 'foo', 'espath': 'arguments/0' }]
          }
        ]
      });
      baseAssert(/^AssertionError/.test(e.name));
    }
  });

  it('assertion with optional message argument.', () => {
    const falsy = 0;
    try {
      eval(weave('assert(falsy, "assertion message");'));
      baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
      baseAssert.deepStrictEqual(e.powerAssertContext, {
        'source': {
          'content': 'assert(falsy, "assertion message")',
          'filepath': 'test/some_test.js',
          'line': 1
        },
        'args': [
          {
            'value': 0,
            'events': [
              { 'value': 0, 'espath': 'arguments/0' }
            ]
          }
        ]
      });
      baseAssert(/^AssertionError/.test(e.name));
    }
  });

  it('empowered function also acts like an assert function', () => {
    const falsy = 0;
    try {
      eval(weave('assert(falsy);'));
      baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
      baseAssert.deepStrictEqual(e.powerAssertContext, {
        'source': {
          'content': 'assert(falsy)',
          'filepath': 'test/some_test.js',
          'line': 1
        },
        'args': [
          {
            'value': 0,
            'events': [
              { 'value': 0, 'espath': 'arguments/0' }
            ]
          }
        ]
      });
      baseAssert(/^AssertionError/.test(e.name));
    }
  });

  describe('assertion method with one argument', () => {
    it('Identifier', () => {
      const falsy = 0;
      try {
        eval(weave('assert.ok(falsy);'));
        baseAssert.ok(false, 'AssertionError should be thrown');
      } catch (e) {
        baseAssert.deepStrictEqual(e.powerAssertContext, {
          'source': {
            'content': 'assert.ok(falsy)',
            'filepath': 'test/some_test.js',
            'line': 1
          },
          'args': [
            {
              'value': 0,
              'events': [
                { 'value': 0, 'espath': 'arguments/0' }
              ]
            }
          ]
        });
        baseAssert(/^AssertionError/.test(e.name));
      }
    });
  });

  describe('assertion method with two arguments', () => {
    it('both Identifier', () => {
      const foo = 'foo';
      const bar = 'bar';
      try {
        eval(weave('assert.equal(foo, bar);'));
        baseAssert.ok(false, 'AssertionError should be thrown');
      } catch (e) {
        baseAssert.deepStrictEqual(e.powerAssertContext, {
          'source': {
            'content': 'assert.equal(foo, bar)',
            'filepath': 'test/some_test.js',
            'line': 1
          },
          'args': [
            {
              'value': 'foo',
              'events': [{ 'value': 'foo', 'espath': 'arguments/0' }]
            },
            {
              'value': 'bar',
              'events': [{ 'value': 'bar', 'espath': 'arguments/1' }]
            }
          ]
        });
        baseAssert(/^AssertionError/.test(e.name));
      }
    });

    it('first argument is Literal', () => {
      const bar = 'bar';
      try {
        eval(weave('assert.equal("foo", bar);'));
        baseAssert.ok(false, 'AssertionError should be thrown');
      } catch (e) {
        baseAssert.deepStrictEqual(e.powerAssertContext, {
          'source': {
            'content': 'assert.equal("foo", bar)',
            'filepath': 'test/some_test.js',
            'line': 1
          },
          'args': [
            {
              'value': 'bar',
              'events': [{ 'value': 'bar', 'espath': 'arguments/1' }]
            }
          ]
        });
        baseAssert(/^AssertionError/.test(e.name));
      }
    });

    it('second argument is Literal', () => {
      const foo = 'foo';
      try {
        eval(weave('assert.equal(foo, "bar");'));
        baseAssert.ok(false, 'AssertionError should be thrown');
      } catch (e) {
        baseAssert.deepStrictEqual(e.powerAssertContext, {
          'source': {
            'content': 'assert.equal(foo, "bar")',
            'filepath': 'test/some_test.js',
            'line': 1
          },
          'args': [
            {
              'value': 'foo',
              'events': [{ 'value': 'foo', 'espath': 'arguments/0' }]
            }
          ]
        });
        baseAssert(/^AssertionError/.test(e.name));
      }
    });
  });

  describe('yield for assertion inside generator', () => {
    it('yield falsy', (done) => {
      const falsy = Promise.resolve(0);

      function onError (e) {
        try {
          if (!e) {
            return done(new Error('Assertion Error should be thrown'));
          }
          baseAssert.deepStrictEqual(e.powerAssertContext, {
            'source': {
              'content': 'assert.ok(yield falsy)',
              'filepath': 'test/some_test.js',
              'generator': true,
              'line': 2
            },
            'args': [
              {
                'value': 0,
                'events': [
                  { 'value': 0, 'espath': 'arguments/0' }
                ]
              }
            ]
          });
          baseAssert(/^AssertionError/.test(e.name));
        } catch (e) {
          return done(e);
        }
        done();
      }

      function onResult () {
        done(new Error('promise should not resolve'));
      }

      const code = [
        'function *gen() {',
        '    assert.ok(yield falsy);',
        '}',
        '',
        'const g = gen();',
        '',
        'g.next().value',
        '  .then((val) => g.next(val))',
        '  .then(onResult)',
        '  .catch(onError);'
      ].join('\n');

      eval(weave(code));
    });
  });

  if (isAsyncAwaitSupported) {
    describe('await assertion inside async async function', () => {
      it('yield falsy', (done) => {
        const falsy = Promise.resolve(0);

        function onError (e) {
          try {
            if (!e) {
              return done(new Error('Assertion Error should be thrown'));
            }
            baseAssert.deepStrictEqual(e.powerAssertContext, {
              'source': {
                'content': 'assert.ok(await falsy)',
                'filepath': 'test/some_test.js',
                'async': true,
                'line': 2
              },
              'args': [
                {
                  'value': 0,
                  'events': [
                    { 'value': 0, 'espath': 'arguments/0' }
                  ]
                }
              ]
            });
            baseAssert(/^AssertionError/.test(e.name));
          } catch (e) {
            return done(e);
          }
          done();
        }

        function onResult () {
          done(new Error('promise should not resolve'));
        }

        const code = [
          'async function gen() {',
          '    assert.ok(await falsy);',
          '}',
          'gen()',
          '  .then(onResult)',
          '  .catch(onError);'
        ].join('\n');

        eval(weave(code));
      });
    });
  }
});

it('the case when assertion function call is not listed in patterns (even if methods do)', () => {
  const patterns = [
    'assert.ok(value, [message])',
    'assert.equal(actual, expected, [message])',
    'assert.notEqual(actual, expected, [message])',
    'assert.strictEqual(actual, expected, [message])',
    'assert.notStrictEqual(actual, expected, [message])',
    'assert.deepEqual(actual, expected, [message])',
    'assert.notDeepEqual(actual, expected, [message])',
    'assert.deepStrictEqual(actual, expected, [message])',
    'assert.notDeepStrictEqual(actual, expected, [message])'
  ];
  const assert = empower(baseAssert, { patterns: patterns });

  const falsy = 0;
  try {
    eval(weave('assert(falsy, "assertion message");', patterns));
    baseAssert.ok(false, 'AssertionError should be thrown');
  } catch (e) {
    baseAssert.strictEqual(e.message, 'assertion message', 'should not be empowered');
    baseAssert(/^AssertionError/.test(e.name));
  }
});

describe('on rethrowing Error', () => {
  it('rethrow behavior - name replacement', () => {
    try {
      try {
        throw new baseAssert.AssertionError({
          actual: 'hoge',
          expected: 'fuga',
          operator: '==',
          message: 'HOOOOOOOO'
        });
      } catch (e) {
        e.foo = 'bar';
        e.message = 'BARRRRRRRR';
        throw e;
      }
    } catch (e) {
      baseAssert.strictEqual(e.message, 'BARRRRRRRR');
    }
  });
  it('rethrow behavior - new props', () => {
    try {
      try {
        throw new baseAssert.AssertionError({
          actual: 'hoge',
          expected: 'fuga',
          operator: '==',
          message: 'HOOOOOOOO'
        });
      } catch (e) {
        e.foo = 'bar';
        throw e;
      }
    } catch (e) {
      baseAssert.strictEqual(e.foo, 'bar');
    }
  });
});

describe('custom logging event handlers', () => {
  let log;
  const assert = empower(baseAssert, {
    onError: function () {
      const data = ['error', slice.call(arguments)];
      log.push(data);
      return data;
    },
    onSuccess: function () {
      const data = ['success', slice.call(arguments)];
      log.push(data);
      return data;
    }
  });

  beforeEach(() => {
    log = [];
  });

  it('log assertion failures with onError', () => {
    const data = eval(weave('assert.equal(2 + 2, 5, "Where did you learn math?")'));
    baseAssert.strictEqual(log.length, 1);
    assert.strictEqual(data, log[0], 'it returns the result of onError');
    baseAssert.strictEqual(log[0][0], 'error');
    const event = log[0][1][0];
    baseAssert.strictEqual(event.originalMessage, 'Where did you learn math?');
    baseAssert.strictEqual(event.assertionThrew, true);
    baseAssert(event.error instanceof baseAssert.AssertionError, 'instanceof AssertionError');
    baseAssert(event.powerAssertContext, 'has a powerAssertContext');
  });

  it('log successful assertions with onSuccess', () => {
    const data = eval(weave('assert.equal(2 + 2, 4, "Good job!")'));
    baseAssert.strictEqual(log.length, 1);
    assert.strictEqual(data, log[0], 'it returns the result of onSuccess');
    baseAssert.strictEqual(log[0][0], 'success');
    const event = log[0][1][0];
    baseAssert.strictEqual(event.originalMessage, 'Good job!');
    baseAssert.strictEqual(event.assertionThrew, false);
    baseAssert(event.powerAssertContext, 'has a powerAssertContext');
    baseAssert.strictEqual(event.powerAssertContext.source.content, 'assert.equal(2 + 2, 4, "Good job!")');
  });

  it('non-instrumented code: log assertion failures with onError', () => {
    const data = assert.strictEqual(2 + 2, 5, 'Maybe in an alternate universe.');
    baseAssert.strictEqual(log.length, 1);
    assert.strictEqual(data, log[0], 'it returns the result of onError');
    baseAssert.strictEqual(log[0][0], 'error');
    const event = log[0][1][0];
    baseAssert.strictEqual(event.originalMessage, 'Maybe in an alternate universe.');
    baseAssert.strictEqual(event.assertionThrew, true);
    baseAssert(event.error instanceof baseAssert.AssertionError, 'instanceof AssertionError');
    baseAssert(!event.powerAssertContext, 'does not have a powerAssertContext');
    baseAssert.deepStrictEqual(event.args, [4, 5, 'Maybe in an alternate universe.'], 'attaches event.args');
  });

  it('non-instrumented code: log successful assertions with onSuccess', () => {
    const data = assert.strictEqual(2 + 2, 4, 'Gold star!');
    baseAssert.strictEqual(log.length, 1);
    assert.strictEqual(data, log[0], 'it returns the result of onSuccess');
    baseAssert.strictEqual(log[0][0], 'success');
    const event = log[0][1][0];
    baseAssert.strictEqual(event.originalMessage, 'Gold star!');
    baseAssert.strictEqual(event.assertionThrew, false);
    baseAssert(!event.powerAssertContext, 'does not have a powerAssertContext');
    baseAssert.deepStrictEqual(event.args, [4, 4, 'Gold star!'], 'attaches event.args');
  });
});

describe('onSuccess can throw', () => {
  const assert = empower(baseAssert, {
    onSuccess: function (event) {
      const error = new Error('successful assertion');
      error.relatedEvent = event;
      throw error;
    }
  });

  it('instrumented code', () => {
    try {
      eval(weave('assert.equal(2 + 2, 4, "yes. yes it is");'));
    } catch (e) {
      baseAssert.strictEqual(e.message, 'successful assertion');
      baseAssert(e.relatedEvent.powerAssertContext, 'has powerAssertContext');
      return;
    }
    baseAssert.fail('should have thrown');
  });

  it('non-instrumented code', () => {
    try {
      assert.strictEqual(2 + 2, 4, 'yes. yes it is');
    } catch (e) {
      baseAssert.strictEqual(e.message, 'successful assertion');
      baseAssert(!e.relatedEvent.powerAssertContext, 'does not have powerAssertContext');
      return;
    }
    baseAssert.fail('should have thrown');
  });
});

describe('metadata for enhanced methods', () => {
  const assert = empower(
    {
      fail: function (message) {
        baseAssert.ok(false, message);
      },
      pass: function (message) {
        // noop
      }
    },
    {
      patterns: [
        {
          pattern: 'assert.fail([message])',
          defaultMessage: 'User! You have failed this assertion!'
        },
        'assert.pass([message])'
      ],
      onError: function (event) {
        baseAssert.strictEqual(event.assertionThrew, true);
        return event;
      },
      onSuccess: function (event) {
        baseAssert.strictEqual(event.assertionThrew, false);
        return event;
      }
    }
  );

  it('instrumented', () => {
    const event = eval(weave("assert.fail('doh!');"));
    baseAssert.strictEqual(event.defaultMessage, 'User! You have failed this assertion!');
    baseAssert.strictEqual(event.enhanced, true);
    baseAssert.strictEqual(event.assertionFunction, assert.fail);
    baseAssert.deepStrictEqual(event.matcherSpec, {
      pattern: 'assert.fail([message])',
      defaultMessage: 'User! You have failed this assertion!',
      parsed: {
        args: [{ name: 'message', optional: true }],
        callee: { object: 'assert', member: 'fail', type: 'MemberExpression' }
      }
    });
  });

  it('non-instrumented', () => {
    const event = assert.fail('doh!');
    baseAssert.strictEqual(event.defaultMessage, 'User! You have failed this assertion!');
    baseAssert.strictEqual(event.enhanced, true);
    baseAssert.strictEqual(event.assertionFunction, assert.fail);
  });
});

describe('wrapOnlyPatterns', () => {
  const assert = empower(
    {
      fail: function (message) {
        baseAssert.ok(false, message);
      },
      pass: function (message) {
        // noop
      }
    },
    {
      wrapOnlyPatterns: [
        {
          pattern: 'assert.fail([message])',
          defaultMessage: 'User! You have failed this assertion!'
        },
        'assert.pass([message])'
      ],
      onError: function (event) {
        baseAssert.strictEqual(event.assertionThrew, true);
        return event;
      },
      onSuccess: function (event) {
        baseAssert.strictEqual(event.assertionThrew, false);
        return event;
      }
    }
  );

  it('instrumented code: success', () => {
    const event = eval(weave('assert.pass("woot!")'));
    baseAssert.strictEqual(event.assertionThrew, false);
    baseAssert.strictEqual(event.enhanced, false);
    baseAssert.strictEqual(event.originalMessage, 'woot!');
    baseAssert.deepStrictEqual(event.args, ['woot!']);
    baseAssert.strictEqual(event.assertionFunction, assert.pass);
  });

  it('instrumented code: error', () => {
    const event = eval(weave('assert.fail("Oh no!")'));
    baseAssert.strictEqual(event.assertionThrew, true);
    baseAssert.strictEqual(event.enhanced, false);
    baseAssert.strictEqual(event.originalMessage, 'Oh no!');
    baseAssert.strictEqual(event.defaultMessage, 'User! You have failed this assertion!');
    baseAssert.deepStrictEqual(event.args, ['Oh no!']);
    baseAssert.strictEqual(event.assertionFunction, assert.fail);
  });

  it('non-instrumented code: success', () => {
    const event = assert.pass('woot!');
    baseAssert.strictEqual(event.assertionThrew, false);
    baseAssert.strictEqual(event.enhanced, false);
    baseAssert.strictEqual(event.originalMessage, 'woot!');
    baseAssert.deepStrictEqual(event.args, ['woot!']);
    baseAssert.strictEqual(event.assertionFunction, assert.pass);
  });

  it('non-instrumented code: error', () => {
    const event = assert.fail('Oh no!');
    baseAssert.strictEqual(event.assertionThrew, true);
    baseAssert.strictEqual(event.enhanced, false);
    baseAssert.strictEqual(event.originalMessage, 'Oh no!');
    baseAssert.strictEqual(event.defaultMessage, 'User! You have failed this assertion!');
    baseAssert.deepStrictEqual(event.args, ['Oh no!']);
    baseAssert.strictEqual(event.assertionFunction, assert.fail);
  });
});

describe('enhancing a prototype', () => {
  it('you can enhance a prototype', () => {
    function AssertionApi (name) {
      this.name = name;
      this.assertions = [];
    }

    AssertionApi.prototype.name = 'prototype';

    AssertionApi.prototype.strictEqual = function (actual, expected, message) {
      this.assertions.push(actual + ' === ' + expected);
      baseAssert.strictEqual(actual, expected, message);
    };

    function onAssertion (event) {
      baseAssert.strictEqual(this, event.thisObj);
      return event.thisObj;
    }

    empower(AssertionApi.prototype, {
      patterns: [
        'assert.strictEqual(actual, expected, [message])'
      ],
      destructive: true,
      bindReceiver: false,
      onSuccess: onAssertion,
      onError: onAssertion
    });

    const assertA = new AssertionApi('foo');
    const assertB = new AssertionApi('bar');

    const a = assertA.strictEqual('a', 'a');
    const b = assertB.strictEqual('b', 'b');
      
    baseAssert.deepStrictEqual(assertA.assertions, ['a === a']);
    baseAssert.deepStrictEqual(assertB.assertions, ['b === b']);

    baseAssert.strictEqual(a, assertA);
    baseAssert.strictEqual(b, assertB);
  });
});

if (isAsyncAwaitSupported && typeof baseAssert.rejects === 'function') {
  const testsUsingAsyncAwait = require('./async_await_fixture');
  testsUsingAsyncAwait({ empower, baseAssert, weave });
}
