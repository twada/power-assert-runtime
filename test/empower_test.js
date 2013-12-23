var empower = require('../lib/empower'),
    weave = require('../test_helper').weave,
    fakeFormatter = function (context) {
        return [
            context.location.path,
            context.content
        ].join('\n');
    };


suite('assertion method with one argument', function () {
    var baseAssert = require('assert'),
        assert = empower(baseAssert, fakeFormatter);

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
    var baseAssert = require('assert'),
        assert = empower(baseAssert, fakeFormatter);

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
