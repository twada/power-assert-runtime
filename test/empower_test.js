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
        function extractBodyFrom (source) {
            var tree = esprima.parse(source, {tolerant: true, loc: true, range: true});
            return tree.body[0];
        }

        function extractBodyOfAssertionAsCode (node) {
            var expression;
            if (node.type === 'ExpressionStatement') {
                expression = node.expression;
            }
            return escodegen.generate(expression.arguments[0], {format: {compact: true}});
        }

        function applyEspower (line, options) {
            options = options || {destructive: false, source: line, path: '/path/to/some_test.js', powerAssertVariableName: 'assert'};
            var tree = extractBodyFrom(line);
            return espower(tree, options);
        }

        return function (line, options) {
            return escodegen.generate(applyEspower(line, options), {format: {compact: true}});
        };
    }(),
    fakeFormatter = function (context) {
        return [
            context.location.path,
            context.content,
            JSON.stringify(context.events)
        ].join('\n');
    };


function testWithOption (option) {
    var assert = empower(baseAssert, fakeFormatter, option);


test('empowered function also acts like an assert function', function () {
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
                '[{"value":0,"kind":"ident","location":{"start":{"line":1,"column":7}}}]'
            ].join('\n'));
        }
        if (option.saveContextOnFail) {
            baseAssert.deepEqual(e.powerAssertContext, {
                "value":0,
                "location":{"start":{"line":1,"column":7},"path":"/path/to/some_test.js"},
                "content":"assert(falsy);",
                "events": [{"value":0,"kind":"ident","location":{"start":{"line":1,"column":7}}}]
            });
        }
    }
});


suite('assertion method with one argument', function () {
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
                    '[{"value":0,"kind":"ident","location":{"start":{"line":1,"column":10}}}]'
                ].join('\n'));
            }
            if (option.saveContextOnFail) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "value":0,
                    "location":{"start":{"line":1,"column":10},"path":"/path/to/some_test.js"},
                    "content":"assert.ok(falsy);",
                    "events": [{"value":0,"kind":"ident","location":{"start":{"line":1,"column":10}}}]
                });
            }
        }
    });
});


suite('assertion method with two arguments', function () {
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
                    '[{"value":"foo","kind":"ident","location":{"start":{"line":1,"column":13}}},{"value":"bar","kind":"ident","location":{"start":{"line":1,"column":18}}}]'
                ].join('\n'));
            }
            if (option.saveContextOnFail) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "value":"foo",
                    "location":{"start":{"line":1,"column":13},"path":"/path/to/some_test.js"},
                    "content":"assert.equal(foo, bar);",
                    "events": [{"value":"foo","kind":"ident","location":{"start":{"line":1,"column":13}}},{"value":"bar","kind":"ident","location":{"start":{"line":1,"column":18}}}]
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
                    '[{"value":"bar","kind":"ident","location":{"start":{"line":1,"column":20}}}]'
                ].join('\n'));
            }
            if (option.saveContextOnFail) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "value":"bar",
                    "location":{"start":{"line":1,"column":20},"path":"/path/to/some_test.js"},
                    "content":"assert.equal(\"foo\", bar);",
                    "events": [{"value":"bar","kind":"ident","location":{"start":{"line":1,"column":20}}}]
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
                    '[{"value":"foo","kind":"ident","location":{"start":{"line":1,"column":13}}}]'
                ].join('\n'));
            }
            if (option.saveContextOnFail) {
                baseAssert.deepEqual(e.powerAssertContext, {
                    "value":"foo",
                    "location":{"start":{"line":1,"column":13},"path":"/path/to/some_test.js"},
                    "content":"assert.equal(foo, \"bar\");",
                    "events": [{"value":"foo","kind":"ident","location":{"start":{"line":1,"column":13}}}]
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
