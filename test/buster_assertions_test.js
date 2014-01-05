(function (root, factory) {
    'use strict';

    var dependencies = [
        '../lib/empower',
        'espower',
        'esprima',
        'escodegen',
        'assert',
        'buster-assertions'
    ];

    if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    } else if (typeof exports === 'object') {
        factory.apply(root, dependencies.map(function (path) { return require(path); }));
    } else {
        factory.apply(root, dependencies.map(function (path) {
            var tokens = path.split('/'),
                basename = tokens[tokens.length - 1],
                subnames = basename.split('-');
            return root[subnames[0]];
        }));
    }
}(this, function (
    empower,
    espower,
    esprima,
    escodegen,
    baseAssert,
    busterAssertions
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
            options = options || {
                destructive: false,
                source: line,
                path: '/path/to/some_test.js',
                powerAssertVariableName: 'assert',
                targetMethods: {
                    oneArg: ['isNull'],
                    twoArgs: ['same']
                }
            };
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

    var assert = empower(busterAssertions.assert, fakeFormatter, {
        targetMethods: {
            oneArg: ['isNull'],
            twoArgs: ['same']
        }
    });


    test('buster assertion is also an assert function', function () {
        var falsy = 0;
        try {
            eval(weave('assert(falsy);'));
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            baseAssert.equal(e.message, [
                '/path/to/some_test.js',
                'assert(falsy);',
                '[{"value":0,"kind":"ident","location":{"start":{"line":1,"column":7}}}]'
            ].join('\n'));
        }
    });


    suite('buster assertion with one argument', function () {
        test('isNull method', function () {
            var falsy = 0;
            try {
                eval(weave('assert.isNull(falsy);'));
                assert.ok(false, 'AssertionError should be thrown');
            } catch (e) {
                baseAssert.equal(e.name, 'AssertionError');
                baseAssert.equal(e.message, [
                    '[assert.isNull] /path/to/some_test.js',
                    'assert.isNull(falsy);',
                    '[{"value":0,"kind":"ident","location":{"start":{"line":1,"column":14}}}]: Expected 0 to be null'
                ].join('\n'));
            }
        });
    });


    suite('assertion method with two arguments', function () {
        test('both Identifier', function () {
            var foo = 'foo', bar = 'bar';
            try {
                eval(weave('assert.same(foo, bar);'));
                assert.ok(false, 'AssertionError should be thrown');
            } catch (e) {
                baseAssert.equal(e.name, 'AssertionError');
                baseAssert.equal(e.message, [
                    '[assert.same] /path/to/some_test.js',
                    'assert.same(foo, bar);',
                    '[{"value":"foo","kind":"ident","location":{"start":{"line":1,"column":12}}},{"value":"bar","kind":"ident","location":{"start":{"line":1,"column":17}}}]: foo expected to be the same object as bar'
                ].join('\n'));
            }
        });

        test('first argument is Literal', function () {
            var bar = 'bar';
            try {
                eval(weave('assert.same("foo", bar);'));
                assert.ok(false, 'AssertionError should be thrown');
            } catch (e) {
                baseAssert.equal(e.name, 'AssertionError');
                baseAssert.equal(e.message, [
                    '[assert.same] /path/to/some_test.js',
                    'assert.same("foo", bar);',
                    '[{"value":"bar","kind":"ident","location":{"start":{"line":1,"column":19}}}]: foo expected to be the same object as bar'
                ].join('\n'));
            }
        });

        test('second argument is Literal', function () {
            var foo = 'foo';
            try {
                eval(weave('assert.same(foo, "bar");'));
                assert.ok(false, 'AssertionError should be thrown');
            } catch (e) {
                baseAssert.equal(e.name, 'AssertionError');
                baseAssert.equal(e.message, [
                    '[assert.same] /path/to/some_test.js',
                    'assert.same(foo, "bar");',
                    '[{"value":"foo","kind":"ident","location":{"start":{"line":1,"column":12}}}]: foo expected to be the same object as bar'
                ].join('\n'));
            }
        });
    });

}));
