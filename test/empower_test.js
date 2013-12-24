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
            context.content
        ].join('\n');
    };


suite('assertion method with one argument', function () {
    var assert = empower(baseAssert, fakeFormatter);

    test('Identifier', function () {
        var falsy = 0;
        try {
            eval(weave('assert(falsy);'));
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            baseAssert.equal(e.message, [
                '/path/to/some_test.js',
                'assert(falsy);'
            ].join('\n'));
        }
    });
});


suite('assertion method with two arguments', function () {
    var assert = empower(baseAssert, fakeFormatter);

    test('both Identifier', function () {
        var foo = 'foo', bar = 'bar';
        try {
            eval(weave('assert.equal(foo, bar);'));
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            baseAssert.equal(e.message, [
                '/path/to/some_test.js',
                'assert.equal(foo, bar);'
            ].join('\n'));
        }
    });

    test('first argument is Literal', function () {
        var bar = 'bar';
        try {
            eval(weave('assert.equal("foo", bar);'));
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            baseAssert.equal(e.message, [
                '/path/to/some_test.js',
                'assert.equal("foo", bar);'
            ].join('\n'));
        }
    });

    test('second argument is Literal', function () {
        var foo = 'foo';
        try {
            eval(weave('assert.equal(foo, "bar");'));
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            baseAssert.equal(e.message, [
                '/path/to/some_test.js',
                'assert.equal(foo, "bar");'
            ].join('\n'));
        }
    });
});

}));
