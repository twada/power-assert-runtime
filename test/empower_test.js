(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['empower', 'espower', 'acorn', 'escodegen', 'assert'], factory);
    } else if (typeof exports === 'object') {
        factory(require('..'), require('espower'), require('acorn'), require('escodegen'), require('assert'));
    } else {
        factory(root.empower, root.espower, root.acorn, root.escodegen, root.assert);
    }
}(this, function (
    empower,
    espower,
    acorn,
    escodegen,
    baseAssert
) {

// see: https://github.com/Constellation/escodegen/issues/115
if (typeof define === 'function' && define.amd) {
    escodegen = window.escodegen;
}

    var weave = function (line, patterns) {
        var filepath = '/path/to/some_test.js';
        var espowerOptions = {
            source: line,
            path: filepath,
            destructive: true
        };
        if (patterns) {
            espowerOptions.patterns = patterns;
        }
        var jsAST = acorn.parse(line, {ecmaVersion: 6, locations: true, sourceType: 'module', sourceFile: filepath});
        var espoweredAST = espower(jsAST, espowerOptions);
        return escodegen.generate(espoweredAST, {format: {compact: true}});
    },
    fakeFormatter = function (context) {
        var events = context.args.reduce(function (accum, arg) {
            return accum.concat(arg.events);
        }, []);
        return [
            context.source.filepath,
            context.source.content,
            JSON.stringify(events)
        ].join('\n');
    };


test('default options behavior', function () {
    var assert = empower(baseAssert, fakeFormatter);

    var falsy = 0;
    try {
        eval(weave('assert(falsy);'));
        baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert.equal(e.message, [
            '/path/to/some_test.js',
            'assert(falsy)',
            '[{"value":0,"espath":"arguments/0"}]'
        ].join('\n'));
        baseAssert.equal(e.name, 'AssertionError');
    }
});


function testWithOption (option) {
    var assert = empower(baseAssert, fakeFormatter, option);


test('Bug reproduction. should not fail if argument is null Literal. ' + JSON.stringify(option), function () {
    var foo = 'foo';
    try {
        eval(weave('assert.equal(foo, null);'));
        baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        if (option.modifyMessageOnRethrow) {
            baseAssert.equal(e.message, [
                '/path/to/some_test.js',
                'assert.equal(foo, null)',
                '[{"value":"foo","espath":"arguments/0"}]'
            ].join('\n'));
        }
        if (option.saveContextOnRethrow) {
            baseAssert.deepEqual(e.powerAssertContext, {
                "source":{
                    "content":"assert.equal(foo, null)",
                    "filepath":"/path/to/some_test.js",
                    "line": 1
                },
                "args":[
                    {
                        "value":"foo",
                        "events":[{"value":"foo","espath":"arguments/0"}]
                    }
                ]
            });
        }
        baseAssert.equal(e.name, 'AssertionError');
    }
});


test('assertion with optional message argument. ' + JSON.stringify(option), function () {
    var falsy = 0;
    try {
        eval(weave('assert(falsy, "assertion message");'));
        baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        if (option.modifyMessageOnRethrow) {
            baseAssert.equal(e.message, [
                'assertion message /path/to/some_test.js',
                'assert(falsy, "assertion message")',
                '[{"value":0,"espath":"arguments/0"}]'
            ].join('\n'));
        }
        if (option.saveContextOnRethrow) {
            baseAssert.deepEqual(e.powerAssertContext, {
                "source":{
                    "content": "assert(falsy, \"assertion message\")",
                    "filepath": "/path/to/some_test.js",
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
        }
        baseAssert.equal(e.name, 'AssertionError');
    }
});


test(JSON.stringify(option) + ' empowered function also acts like an assert function', function () {
    var falsy = 0;
    try {
        eval(weave('assert(falsy);'));
        baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        if (option.modifyMessageOnRethrow) {
            baseAssert.equal(e.message, [
                '/path/to/some_test.js',
                'assert(falsy)',
                '[{"value":0,"espath":"arguments/0"}]'
            ].join('\n'));
        }
        if (option.saveContextOnRethrow) {
            baseAssert.deepEqual(e.powerAssertContext, {
                "source":{
                    "content": "assert(falsy)",
                    "filepath": "/path/to/some_test.js",
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
        }
        baseAssert.equal(e.name, 'AssertionError');
    }
});


suite(JSON.stringify(option) + ' assertion method with one argument', function () {
    test('Identifier', function () {
        var falsy = 0;
        try {
            eval(weave('assert.ok(falsy);'));
            baseAssert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            if (option.modifyMessageOnRethrow) {
                baseAssert.equal(e.message, [
                    '/path/to/some_test.js',
                    'assert.ok(falsy)',
                    '[{"value":0,"espath":"arguments/0"}]'
                ].join('\n'));
            }
            if (option.saveContextOnRethrow) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "source": {
                        "content":"assert.ok(falsy)",
                        "filepath":"/path/to/some_test.js",
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
            }
            baseAssert.equal(e.name, 'AssertionError');
        }
    });
});


suite(JSON.stringify(option) + ' assertion method with two arguments', function () {
    test('both Identifier', function () {
        var foo = 'foo', bar = 'bar';
        try {
            eval(weave('assert.equal(foo, bar);'));
            baseAssert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            if (option.modifyMessageOnRethrow) {
                baseAssert.equal(e.message, [
                    '/path/to/some_test.js',
                    'assert.equal(foo, bar)',
                    '[{"value":"foo","espath":"arguments/0"},{"value":"bar","espath":"arguments/1"}]'
                ].join('\n'));
            }
            if (option.saveContextOnRethrow) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "source":{
                        "content":"assert.equal(foo, bar)",
                        "filepath":"/path/to/some_test.js",
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
            }
            baseAssert.equal(e.name, 'AssertionError');
        }
    });

    test('first argument is Literal', function () {
        var bar = 'bar';
        try {
            eval(weave('assert.equal("foo", bar);'));
            baseAssert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            if (option.modifyMessageOnRethrow) {
                baseAssert.equal(e.message, [
                    '/path/to/some_test.js',
                    'assert.equal("foo", bar)',
                    '[{"value":"bar","espath":"arguments/1"}]'
                ].join('\n'));
            }
            if (option.saveContextOnRethrow) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "source":{
                        "content":"assert.equal(\"foo\", bar)",
                        "filepath":"/path/to/some_test.js",
                        "line": 1
                    },
                    "args": [
                        {
                            "value": "bar",
                            "events": [{"value":"bar","espath":"arguments/1"}]
                        }
                    ]
                });
            }
            baseAssert.equal(e.name, 'AssertionError');
        }
    });

    test('second argument is Literal', function () {
        var foo = 'foo';
        try {
            eval(weave('assert.equal(foo, "bar");'));
            baseAssert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            if (option.modifyMessageOnRethrow) {
                baseAssert.equal(e.message, [
                    '/path/to/some_test.js',
                    'assert.equal(foo, "bar")',
                    '[{"value":"foo","espath":"arguments/0"}]'
                ].join('\n'));
            }
            if (option.saveContextOnRethrow) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "source":{
                        "content":"assert.equal(foo, \"bar\")",
                        "filepath":"/path/to/some_test.js",
                        "line": 1
                    },
                    "args":[
                        {
                            "value":"foo",
                            "events":[{"value":"foo","espath":"arguments/0"}]
                        }
                    ]
                });
            }
            baseAssert.equal(e.name, 'AssertionError');
        }
    });
});

}

testWithOption({
    modifyMessageOnRethrow: false,
    saveContextOnRethrow: false
});

testWithOption({
    modifyMessageOnRethrow: true,
    saveContextOnRethrow: false
});

testWithOption({
    modifyMessageOnRethrow: false,
    saveContextOnRethrow: true
});

testWithOption({
    modifyMessageOnRethrow: true,
    saveContextOnRethrow: true
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
    var assert = empower(baseAssert, fakeFormatter, { patterns: patterns });

    var falsy = 0;
    try {
        eval(weave('assert(falsy);', patterns));
        baseAssert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert.equal(e.message, '0 == true', 'should not be empowered');
        baseAssert.equal(e.name, 'AssertionError');
    }
});


}));
