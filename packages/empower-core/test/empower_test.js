'use strict';

var empower = require('..');
var espower = require('espower');
var acorn = require('acorn');
var acornEs7Plugin = require('acorn-es7-plugin');
acornEs7Plugin(acorn);
var escodegen = require('escodegen');
var baseAssert = require('assert');

    var slice = Array.prototype.slice;

    var weave = function (line, patterns) {
        var filepath = '/absolute/path/to/project/test/some_test.js';
        var espowerOptions = {
            source: line,
            path: filepath,
            sourceRoot: '/absolute/path/to/project/',
            destructive: true
        };
        if (patterns) {
            espowerOptions.patterns = patterns;
        }
        var jsAST = acorn.parse(line, {ecmaVersion: 2018, locations: true, sourceType: 'module', sourceFile: filepath, plugins: {asyncawait: true}});
        var espoweredAST = espower(jsAST, espowerOptions);
        return escodegen.generate(espoweredAST, {format: {compact: true}});
    };


it('default options behavior', function () {
    var assert = empower(baseAssert);

    var falsy = 0;
    try {
        eval(weave('assert(falsy);'));
        baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert.deepEqual(e.powerAssertContext, {
            "source":{
                "content": "assert(falsy)",
                "filepath": "test/some_test.js",
                "line": 1
            },
            "args":[
                {
                    "value": 0,
                    "events": [
                        {"value":0,"espath":"arguments/0"}
                    ]
                }
            ]
        });
        baseAssert(/^AssertionError/.test(e.name));
    }
});

describe('default options: ', function () {

var assert = empower(baseAssert);

it('Bug reproduction. should not fail if argument is null Literal.', function () {
    var foo = 'foo';
    try {
        eval(weave('assert.equal(foo, null);'));
        baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert.deepEqual(e.powerAssertContext, {
            "source":{
                "content":"assert.equal(foo, null)",
                "filepath":"test/some_test.js",
                "line": 1
            },
            "args":[
                {
                    "value":"foo",
                    "events":[{"value":"foo","espath":"arguments/0"}]
                }
            ]
        });
        baseAssert(/^AssertionError/.test(e.name));
    }
});


it('assertion with optional message argument.', function () {
    var falsy = 0;
    try {
        eval(weave('assert(falsy, "assertion message");'));
        baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert.deepEqual(e.powerAssertContext, {
            "source":{
                "content": "assert(falsy, \"assertion message\")",
                "filepath": "test/some_test.js",
                "line": 1
            },
            "args":[
                {
                    "value": 0,
                    "events": [
                        {"value":0,"espath":"arguments/0"}
                    ]
                }
            ]
        });
        baseAssert(/^AssertionError/.test(e.name));
    }
});


it('empowered function also acts like an assert function', function () {
    var falsy = 0;
    try {
        eval(weave('assert(falsy);'));
        baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert.deepEqual(e.powerAssertContext, {
            "source":{
                "content": "assert(falsy)",
                "filepath": "test/some_test.js",
                "line": 1
            },
            "args":[
                {
                    "value": 0,
                    "events": [
                        {"value":0,"espath":"arguments/0"}
                    ]
                }
            ]
        });
        baseAssert(/^AssertionError/.test(e.name));
    }
});


describe('assertion method with one argument', function () {
    it('Identifier', function () {
        var falsy = 0;
        try {
            eval(weave('assert.ok(falsy);'));
            baseAssert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.deepEqual(e.powerAssertContext, {
                "source": {
                    "content":"assert.ok(falsy)",
                    "filepath":"test/some_test.js",
                    "line": 1
                },
                "args":[
                    {
                        "value":0,
                        "events":[
                            {"value":0,"espath":"arguments/0"}
                        ]
                    }
                ]
            });
            baseAssert(/^AssertionError/.test(e.name));
        }
    });
});


describe('assertion method with two arguments', function () {
    it('both Identifier', function () {
        var foo = 'foo', bar = 'bar';
        try {
            eval(weave('assert.equal(foo, bar);'));
            baseAssert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.deepEqual(e.powerAssertContext, {
                "source":{
                    "content":"assert.equal(foo, bar)",
                    "filepath":"test/some_test.js",
                    "line": 1
                },
                "args":[
                    {
                        "value":"foo",
                        "events":[{"value":"foo","espath":"arguments/0"}]
                    },
                    {
                        "value":"bar",
                        "events":[{"value":"bar","espath":"arguments/1"}]
                    }
                ]
            });
            baseAssert(/^AssertionError/.test(e.name));
        }
    });

    it('first argument is Literal', function () {
        var bar = 'bar';
        try {
            eval(weave('assert.equal("foo", bar);'));
            baseAssert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.deepEqual(e.powerAssertContext, {
                "source":{
                    "content":"assert.equal(\"foo\", bar)",
                    "filepath":"test/some_test.js",
                    "line": 1
                },
                "args": [
                    {
                        "value": "bar",
                        "events": [{"value":"bar","espath":"arguments/1"}]
                    }
                ]
            });
            baseAssert(/^AssertionError/.test(e.name));
        }
    });

    it('second argument is Literal', function () {
        var foo = 'foo';
        try {
            eval(weave('assert.equal(foo, "bar");'));
            baseAssert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.deepEqual(e.powerAssertContext, {
                "source":{
                    "content":"assert.equal(foo, \"bar\")",
                    "filepath":"test/some_test.js",
                    "line": 1
                },
                "args":[
                    {
                        "value":"foo",
                        "events":[{"value":"foo","espath":"arguments/0"}]
                    }
                ]
            });
            baseAssert(/^AssertionError/.test(e.name));
        }
    });
});


describe('yield for assertion inside generator', function () {
    it('yield falsy', function (done) {
        var falsy = Promise.resolve(0);

        function onError(e) {
            try {
                if (!e) {
                    return done(new Error('Assertion Error should be thrown'));
                }
                baseAssert.deepEqual(e.powerAssertContext, {
                    "source": {
                        "content": "assert.ok(yield falsy)",
                        "filepath": "test/some_test.js",
                        "generator": true,
                        "line": 2
                    },
                    "args": [
                        {
                            "value": 0,
                            "events": [
                                {"value": 0, "espath": "arguments/0"}
                            ]
                        }
                    ]
                });
                baseAssert(/^AssertionError/.test(e.name));
            } catch (e) {
                return done (e);
            }
            done();
        }

        function onResult() {
            done(new Error('promise should not resolve'));
        }

        var code = [
          'function *gen() {',
          '    assert.ok(yield falsy);',
          '}',
          '',
          'var g = gen();',
          '',
          'g.next().value',
          '  .then((val) => g.next(val))',
          '  .then(onResult)',
          '  .catch(onError);'
        ].join('\n');

        eval(weave(code));
    });
});


var isAsyncAwaitSupported = (function () {
    try {
        eval('async function a() { await b(); }');
        return true;
    } catch (e) {
        if (e instanceof SyntaxError) return false;
        throw e;
    }
})();

if (isAsyncAwaitSupported) {
describe('await assertion inside async async function', function () {
    it('yield falsy', function (done) {
        var falsy = Promise.resolve(0);

        function onError(e) {
            try {
                if (!e) {
                    return done(new Error('Assertion Error should be thrown'));
                }
                baseAssert.deepEqual(e.powerAssertContext, {
                    "source": {
                        "content": "assert.ok(await falsy)",
                        "filepath": "test/some_test.js",
                        "async": true,
                        "line": 2
                    },
                    "args": [
                        {
                            "value": 0,
                            "events": [
                                {"value": 0, "espath": "arguments/0"}
                            ]
                        }
                    ]
                });
                baseAssert(/^AssertionError/.test(e.name));
            } catch (e) {
                return done (e);
            }
            done();
        }

        function onResult() {
            done(new Error('promise should not resolve'));
        }

        var code = [
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


it('the case when assertion function call is not listed in patterns (even if methods do)', function () {
    var patterns = [
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
    var assert = empower(baseAssert, { patterns: patterns });

    var falsy = 0;
    try {
        eval(weave('assert(falsy, "assertion message");', patterns));
        baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert.equal(e.message, 'assertion message', 'should not be empowered');
        baseAssert(/^AssertionError/.test(e.name));
    }
});


describe('on rethrowing Error', function () {
    it('rethrow behavior - name replacement', function () {
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
            baseAssert.equal(e.message, 'BARRRRRRRR');
        }
    });
    it('rethrow behavior - new props', function () {
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
            baseAssert.equal(e.foo, 'bar');
        }
    });
});

describe('custom logging event handlers', function () {
    var log;
    var assert = empower(baseAssert, {
        onError: function () {
            var data = ['error', slice.call(arguments)];
            log.push(data);
            return data;
        },
        onSuccess: function () {
            var data = ['success', slice.call(arguments)];
            log.push(data);
            return data;
        }
    });

    beforeEach(function () {
        log = [];
    });

    it('log assertion failures with onError', function () {
        var data = eval(weave('assert.equal(2 + 2, 5, "Where did you learn math?")'));
        baseAssert.strictEqual(log.length, 1);
        assert.strictEqual(data, log[0], 'it returns the result of onError');
        baseAssert.strictEqual(log[0][0], 'error');
        var event = log[0][1][0];
        baseAssert.strictEqual(event.originalMessage, 'Where did you learn math?');
        baseAssert.strictEqual(event.assertionThrew, true);
        baseAssert(event.error instanceof baseAssert.AssertionError, 'instanceof AssertionError');
        baseAssert(event.powerAssertContext, 'has a powerAssertContext');
    });

    it('log successful assertions with onSuccess', function () {
        var data = eval(weave('assert.equal(2 + 2, 4, "Good job!")'));
        baseAssert.strictEqual(log.length, 1);
        assert.strictEqual(data, log[0], 'it returns the result of onSuccess');
        baseAssert.strictEqual(log[0][0], 'success');
        var event = log[0][1][0];
        baseAssert.strictEqual(event.originalMessage, 'Good job!');
        baseAssert.strictEqual(event.assertionThrew, false);
        baseAssert(event.powerAssertContext, 'has a powerAssertContext');
        baseAssert.equal(event.powerAssertContext.source.content, 'assert.equal(2 + 2, 4, "Good job!")');
    });

    it('non-instrumented code: log assertion failures with onError', function () {
        var data = assert.equal(2 + 2, 5, 'Maybe in an alternate universe.');
        baseAssert.strictEqual(log.length, 1);
        assert.strictEqual(data, log[0], 'it returns the result of onError');
        baseAssert.strictEqual(log[0][0], 'error');
        var event = log[0][1][0];
        baseAssert.strictEqual(event.originalMessage, 'Maybe in an alternate universe.');
        baseAssert.strictEqual(event.assertionThrew, true);
        baseAssert(event.error instanceof baseAssert.AssertionError, 'instanceof AssertionError');
        baseAssert(!event.powerAssertContext, 'does not have a powerAssertContext');
        baseAssert.deepEqual(event.args, [4, 5, 'Maybe in an alternate universe.'], 'attaches event.args');
    });

    it('non-instrumented code: log successful assertions with onSuccess', function () {
        var data = assert.equal(2 + 2, 4, 'Gold star!');
        baseAssert.strictEqual(log.length, 1);
        assert.strictEqual(data, log[0], 'it returns the result of onSuccess');
        baseAssert.strictEqual(log[0][0], 'success');
        var event = log[0][1][0];
        baseAssert.strictEqual(event.originalMessage, 'Gold star!');
        baseAssert.strictEqual(event.assertionThrew, false);
        baseAssert(!event.powerAssertContext, 'does not have a powerAssertContext');
        baseAssert.deepEqual(event.args, [4, 4, 'Gold star!'], 'attaches event.args');
    });
});

describe('onSuccess can throw', function () {
    var assert = empower(baseAssert, {
        onSuccess: function (event) {
            var error = new Error('successful assertion');
            error.relatedEvent = event;
            throw error;
        }
    });

    it('instrumented code', function () {
        try {
            eval(weave('assert.equal(2 + 2, 4, "yes. yes it is");'));
        } catch (e) {
            baseAssert.strictEqual(e.message, 'successful assertion');
            baseAssert(e.relatedEvent.powerAssertContext, 'has powerAssertContext');
            return;
        }
        baseAssert.fail('should have thrown');
    });

    it('non-instrumented code', function () {
        try {
            assert.equal(2 + 2, 4, 'yes. yes it is');
        } catch (e) {
            baseAssert.strictEqual(e.message, 'successful assertion');
            baseAssert(!e.relatedEvent.powerAssertContext, 'does not have powerAssertContext');
            return;
        }
        baseAssert.fail('should have thrown');
    });
});

describe('metadata for enhanced methods', function () {
    var assert = empower(
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
              baseAssert.equal(event.assertionThrew, true);
              return event;
          },
          onSuccess: function (event) {
              baseAssert.equal(event.assertionThrew, false);
              return event;
          }
      }
    );

    it('instrumented', function () {
        var event = eval(weave("assert.fail('doh!');"));
        baseAssert.equal(event.defaultMessage, 'User! You have failed this assertion!');
        baseAssert.strictEqual(event.enhanced, true);
        baseAssert.strictEqual(event.assertionFunction, assert.fail);
        baseAssert.deepEqual(event.matcherSpec, {
            pattern: 'assert.fail([message])',
            defaultMessage: 'User! You have failed this assertion!',
            parsed: {
                args: [{name: 'message', optional: true}],
                callee: {object: 'assert', member: 'fail', type: 'MemberExpression'}
            }
        });
    });

    it('non-instrumented', function () {
        var event = assert.fail('doh!');
        baseAssert.equal(event.defaultMessage, 'User! You have failed this assertion!');
        baseAssert.strictEqual(event.enhanced, true);
        baseAssert.strictEqual(event.assertionFunction, assert.fail);
    });
});

describe('wrapOnlyPatterns', function () {
    var assert = empower(
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
              baseAssert.equal(event.assertionThrew, true);
              return event;
          },
          onSuccess: function (event) {
              baseAssert.equal(event.assertionThrew, false);
              return event;
          }
      }
    );

    it('instrumented code: success', function () {
        var event = eval(weave('assert.pass("woot!")'));
        baseAssert.equal(event.assertionThrew, false);
        baseAssert.strictEqual(event.enhanced, false);
        baseAssert.equal(event.originalMessage, 'woot!');
        baseAssert.deepEqual(event.args, ['woot!']);
        baseAssert.strictEqual(event.assertionFunction, assert.pass);
    });

    it('instrumented code: error', function () {
        var event = eval(weave('assert.fail("Oh no!")'));
        baseAssert.equal(event.assertionThrew, true);
        baseAssert.strictEqual(event.enhanced, false);
        baseAssert.equal(event.originalMessage, 'Oh no!');
        baseAssert.equal(event.defaultMessage, 'User! You have failed this assertion!');
        baseAssert.deepEqual(event.args, ['Oh no!']);
        baseAssert.strictEqual(event.assertionFunction, assert.fail);
    });

    it('non-instrumented code: success', function () {
        var event = assert.pass('woot!');
        baseAssert.equal(event.assertionThrew, false);
        baseAssert.strictEqual(event.enhanced, false);
        baseAssert.equal(event.originalMessage, 'woot!');
        baseAssert.deepEqual(event.args, ['woot!']);
        baseAssert.strictEqual(event.assertionFunction, assert.pass);
    });

    it('non-instrumented code: error', function () {
        var event = assert.fail('Oh no!');
        baseAssert.equal(event.assertionThrew, true);
        baseAssert.strictEqual(event.enhanced, false);
        baseAssert.equal(event.originalMessage, 'Oh no!');
        baseAssert.equal(event.defaultMessage, 'User! You have failed this assertion!');
        baseAssert.deepEqual(event.args, ['Oh no!']);
        baseAssert.strictEqual(event.assertionFunction, assert.fail);
    });
});

describe('enhancing a prototype', function () {
    it('you can enhance a prototype', function () {
        function AssertionApi(name) {
            this.name = name;
            this.assertions = [];
        }

        AssertionApi.prototype.name = 'prototype';

        AssertionApi.prototype.equal = function (actual, expected, message) {
            this.assertions.push(actual + ' == ' + expected);
            baseAssert.equal(actual, expected, message);
        };

        function onAssertion(event) {
            baseAssert.strictEqual(this, event.thisObj);
            return event.thisObj;
        }

        empower(AssertionApi.prototype, {
            patterns: [
                'assert.equal(actual, expected, [message])'
            ],
            destructive: true,
            bindReceiver: false,
            onSuccess: onAssertion,
            onError: onAssertion
        });

        var assertA = new AssertionApi('foo');
        var assertB = new AssertionApi('bar');

        var a = assertA.equal('a', 'a');
        var b = assertB.equal('b', 'b');

        baseAssert.deepEqual(assertA.assertions, ['a == a']);
        baseAssert.deepEqual(assertB.assertions, ['b == b']);

        baseAssert.strictEqual(a, assertA);
        baseAssert.strictEqual(b, assertB);
    });
});
