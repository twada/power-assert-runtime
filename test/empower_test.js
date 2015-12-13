(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['empower-core', 'espower', 'acorn', 'acorn-es7-plugin', 'babel', 'escodegen', 'assert'], factory);
    } else if (typeof exports === 'object') {
        factory(require('..'), require('espower'), require('acorn'), require('acorn-es7-plugin'), require('babel-core'), require('escodegen'), require('assert'));
    } else {
        factory(root.empowerCore, root.espower, root.acorn, root.acornEs7Plugin, root.babel, root.escodegen, root.assert);
    }
}(this, function (
    empower,
    espower,
    acorn,
    acornEs7Plugin,
    babel,
    escodegen,
    baseAssert
) {
    acornEs7Plugin(acorn);

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
        var jsAST = acorn.parse(line, {ecmaVersion: 7, locations: true, sourceType: 'module', sourceFile: filepath, plugins: {asyncawait: true}});
        var espoweredAST = espower(jsAST, espowerOptions);
        var code = escodegen.generate(espoweredAST, {format: {compact: true}});
        return babel.transform(code).code;
    };


test('default options behavior', function () {
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
        baseAssert.equal(e.name, 'AssertionError');
    }
});

suite('default options: ', function () {

var assert = empower(baseAssert);

test('Bug reproduction. should not fail if argument is null Literal.', function () {
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
        baseAssert.equal(e.name, 'AssertionError');
    }
});


test('assertion with optional message argument.', function () {
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
        baseAssert.equal(e.name, 'AssertionError');
    }
});


test('empowered function also acts like an assert function', function () {
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
        baseAssert.equal(e.name, 'AssertionError');
    }
});


suite('assertion method with one argument', function () {
    test('Identifier', function () {
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
            baseAssert.equal(e.name, 'AssertionError');
        }
    });
});


suite('assertion method with two arguments', function () {
    test('both Identifier', function () {
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
            baseAssert.equal(e.name, 'AssertionError');
        }
    });

    test('first argument is Literal', function () {
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
            baseAssert.equal(e.name, 'AssertionError');
        }
    });

    test('second argument is Literal', function () {
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
            baseAssert.equal(e.name, 'AssertionError');
        }
    });
});


suite('yield for assertion inside generator', function () {
    test('yield falsy', function (done) {
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
                baseAssert.equal(e.name, 'AssertionError');
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

suite('await assertion inside async async function', function () {
    test('yield falsy', function (done) {
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
                baseAssert.equal(e.name, 'AssertionError');
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
});


test('the case when assertion function call is not listed in patterns (even if methods do)', function () {
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
        eval(weave('assert(falsy);', patterns));
        baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert.equal(e.message, '0 == true', 'should not be empowered');
        baseAssert.equal(e.name, 'AssertionError');
    }
});


suite('on rethrowing Error', function () {
    test('rethrow behavior - name replacement', function () {
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
    test('rethrow behavior - new props', function () {
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

suite('custom logging event handlers', function () {
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

    setup(function () {
        log = [];
    });

    test('log assertion failures with onError', function () {
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

    test('log successful assertions with onSuccess', function () {
        var data = eval(weave('assert.equal(2 + 2, 4, "Good job!")'));
        baseAssert.strictEqual(log.length, 1);
        assert.strictEqual(data, log[0], 'it returns the result of onSuccess');
        baseAssert.strictEqual(log[0][0], 'success');
        var event = log[0][1][0];
        baseAssert.strictEqual(event.originalMessage, 'Good job!');
        baseAssert.strictEqual(event.assertionThrew, false);
        baseAssert(event.powerAssertContext, 'has a powerAssertContext');
    });

    test('non-instrumented code: log assertion failures with onError', function () {
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

    test('non-instrumented code: log successful assertions with onSuccess', function () {
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

suite('onSuccess can throw', function () {
    var assert = empower(baseAssert, {
        onSuccess: function (event) {
            var error = new Error('successful assertion');
            error.relatedEvent = event;
            throw error;
        }
    });

    test('instrumented code', function () {
        try {
            eval(weave('assert.equal(2 + 2, 4, "yes. yes it is");'));
        } catch (e) {
            baseAssert.strictEqual(e.message, 'successful assertion');
            baseAssert(e.relatedEvent.powerAssertContext, 'has powerAssertContext');
            return;
        }
        baseAssert.fail('should have thrown');
    });

    test('non-instrumented code', function () {
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

suite('wrapOnlyPatterns', function () {
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
              'assert.fail([message])',
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

    test('instrumented code: success', function () {
        var event = eval(weave('assert.pass("woot!")'));
        baseAssert.equal(event.assertionThrew, false);
        baseAssert.strictEqual(event.enhanced, false);
        baseAssert.equal(event.originalMessage, 'woot!');
        baseAssert.deepEqual(event.args, ['woot!']);
    });

    test('instrumented code: error', function () {
        var event = eval(weave('assert.fail("Oh no!")'));
        baseAssert.equal(event.assertionThrew, true);
        baseAssert.strictEqual(event.enhanced, false);
        baseAssert.equal(event.originalMessage, 'Oh no!');
        baseAssert.deepEqual(event.args, ['Oh no!']);
    });

    test('non-instrumented code: success', function () {
        var event = assert.pass('woot!');
        baseAssert.equal(event.assertionThrew, false);
        baseAssert.strictEqual(event.enhanced, false);
        baseAssert.equal(event.originalMessage, 'woot!');
        baseAssert.deepEqual(event.args, ['woot!']);
    });

    test('non-instrumented code: error', function () {
        var event = assert.fail('Oh no!');
        baseAssert.equal(event.assertionThrew, true);
        baseAssert.strictEqual(event.enhanced, false);
        baseAssert.equal(event.originalMessage, 'Oh no!');
        baseAssert.deepEqual(event.args, ['Oh no!']);
    });
});

}));
