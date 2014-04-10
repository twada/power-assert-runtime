(function (root, factory) {
    'use strict';

    var dependencies = [
        '../lib/empower',
        'espower',
        'esprima',
        'escodegen',
        'assert'
    ];

    if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    } else if (typeof exports === 'object') {
        factory.apply(root, dependencies.map(function (path) { return require(path); }));
    } else {
        factory.apply(root, dependencies.map(function (path) {
            var tokens = path.split('/');
            return root[tokens[tokens.length - 1]];
        }));
    }
}(this, function (
    empower,
    espower,
    esprima,
    escodegen,
    baseAssert
) {
    // see: https://github.com/Constellation/escodegen/issues/115
    if (typeof define === 'function' && define.amd) {
        escodegen = window.escodegen;
    }

    var weave = function () {
        function applyEspower (line, options) {
            options = options || {destructive: false, source: line, path: '/path/to/some_test.js', powerAssertVariableName: 'assert'};
            var tree = esprima.parse(line, {tolerant: true, loc: true, tokens: true, raw: true});
            return espower(tree, options);
        }

        return function (line, options) {
            return escodegen.generate(applyEspower(line, options), {format: {compact: true}});
        };
    }(),
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


function testWithOption (option) {
    var assert = empower(baseAssert, fakeFormatter, option);


test(JSON.stringify(option) + ' empowered function also acts like an assert function', function () {
    var falsy = 0;
    try {
        eval(weave('assert(falsy);'));
        assert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert.equal(e.name, 'AssertionError');
        if (option.modifyMessageOnFail) {
            baseAssert.equal(e.message, [
                '/path/to/some_test.js',
                'assert(falsy);',
                '[{"value":0,"espath":""}]'
            ].join('\n'));
        }
        if (option.saveContextOnFail) {
            baseAssert.deepEqual(e.powerAssertContext, {
                "source":{
                    "content": "assert(falsy);",
                    "filepath": "/path/to/some_test.js"
                },
                "args":[
                    {
                        "value": 0,
                        "meta": {
                            "tree": {
                                "type":"Identifier",
                                "name":"falsy",
                                "loc":{"start":{"line":1,"column":7},"end":{"line":1,"column":12}}
                            },
                            "tokens":[
                                {
                                    "type":"Identifier",
                                    "value":"falsy",
                                    "loc":{"start":{"line":1,"column":7},"end":{"line":1,"column":12}}
                                }
                            ]
                        },
                        "events": [
                            {"value":0,"espath":""}
                        ]
                    }
                ]
            });
        }
    }
});


suite(JSON.stringify(option) + ' assertion method with one argument', function () {
    test('Identifier', function () {
        var falsy = 0;
        try {
            eval(weave('assert.ok(falsy);'));
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            if (option.modifyMessageOnFail) {
                baseAssert.equal(e.message, [
                    '/path/to/some_test.js',
                    'assert.ok(falsy);',
                    '[{"value":0,"espath":""}]'
                ].join('\n'));
            }
            if (option.saveContextOnFail) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "source": {
                        "content":"assert.ok(falsy);",
                        "filepath":"/path/to/some_test.js"
                    },
                    "args":[
                        {
                            "value":0,
                            "meta":{
                                "tree":{"type":"Identifier","name":"falsy","loc":{"start":{"line":1,"column":10},"end":{"line":1,"column":15}}},
                                "tokens":[
                                    {"type":"Identifier","value":"falsy","loc":{"start":{"line":1,"column":10},"end":{"line":1,"column":15}}}
                                ]
                            },
                            "events":[
                                {"value":0,"espath":""}
                            ]
                        }
                    ]
                });
            }
        }
    });
});


suite(JSON.stringify(option) + ' assertion method with two arguments', function () {
    test('both Identifier', function () {
        var foo = 'foo', bar = 'bar';
        try {
            eval(weave('assert.equal(foo, bar);'));
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            if (option.modifyMessageOnFail) {
                baseAssert.equal(e.message, [
                    '/path/to/some_test.js',
                    'assert.equal(foo, bar);',
                    '[{"value":"foo","espath":""},{"value":"bar","espath":""}]'
                ].join('\n'));
            }
            if (option.saveContextOnFail) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "source":{
                        "content":"assert.equal(foo, bar);",
                        "filepath":"/path/to/some_test.js"
                    },
                    "args":[
                        {
                            "value":"foo",
                            "meta":{
                                "tree":{"type":"Identifier","name":"foo","loc":{"start":{"line":1,"column":13},"end":{"line":1,"column":16}}},
                                "tokens":[
                                    {"type":"Identifier","value":"foo","loc":{"start":{"line":1,"column":13},"end":{"line":1,"column":16}}}
                                ]
                            },
                            "events":[{"value":"foo","espath":""}]
                        },
                        {
                            "value":"bar",
                            "meta":{
                                "tree":{"type":"Identifier","name":"bar","loc":{"start":{"line":1,"column":18},"end":{"line":1,"column":21}}},
                                "tokens":[
                                    {"type":"Identifier","value":"bar","loc":{"start":{"line":1,"column":18},"end":{"line":1,"column":21}}}
                                ]
                            },
                            "events":[{"value":"bar","espath":""}]
                        }
                    ]
                });
            }
        }
    });

    test('first argument is Literal', function () {
        var bar = 'bar';
        try {
            eval(weave('assert.equal("foo", bar);'));
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            if (option.modifyMessageOnFail) {
                baseAssert.equal(e.message, [
                    '/path/to/some_test.js',
                    'assert.equal("foo", bar);',
                    '[{"value":"bar","espath":""}]'
                ].join('\n'));
            }
            if (option.saveContextOnFail) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "source":{
                        "content":"assert.equal(\"foo\", bar);",
                        "filepath":"/path/to/some_test.js"
                    },
                    "args": [
                        {
                            "value": "bar",
                            "meta": {
                                "tree": {"type":"Identifier","name":"bar","loc":{"start":{"line":1,"column":20},"end":{"line":1,"column":23}}},
                                "tokens": [
                                    {"type":"Identifier","value":"bar","loc":{"start":{"line":1,"column":20},"end":{"line":1,"column":23}}}
                                ]
                            },
                            "events": [{"value":"bar","espath":""}]
                        }
                    ]
                });
            }
        }
    });

    test('second argument is Literal', function () {
        var foo = 'foo';
        try {
            eval(weave('assert.equal(foo, "bar");'));
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            if (option.modifyMessageOnFail) {
                baseAssert.equal(e.message, [
                    '/path/to/some_test.js',
                    'assert.equal(foo, "bar");',
                    '[{"value":"foo","espath":""}]'
                ].join('\n'));
            }
            if (option.saveContextOnFail) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "source":{
                        "content":"assert.equal(foo, \"bar\");",
                        "filepath":"/path/to/some_test.js"
                    },
                    "args":[
                        {
                            "value":"foo",
                            "meta":{
                                "tree":{"type":"Identifier","name":"foo","loc":{"start":{"line":1,"column":13},"end":{"line":1,"column":16}}},
                                "tokens":[
                                    {"type":"Identifier","value":"foo","loc":{"start":{"line":1,"column":13},"end":{"line":1,"column":16}}}
                                ]
                            },
                            "events":[{"value":"foo","espath":""}]
                        }
                    ]
                });
            }
        }
    });
});

}

testWithOption({
    modifyMessageOnFail: false,
    saveContextOnFail: false
});

testWithOption({
    modifyMessageOnFail: true,
    saveContextOnFail: false
});

testWithOption({
    modifyMessageOnFail: false,
    saveContextOnFail: true
});

testWithOption({
    modifyMessageOnFail: true,
    saveContextOnFail: true
});

}));
