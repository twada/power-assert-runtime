var empower = require('../lib/empower'),
    weave = require('../test_helper').weave,
    fakeFormatter = {
        format: function (context) {
            return [
                context.location.path,
                context.content
            ];
        }
    };


suite('lineSeparator option', function () {
    function lineSeparatorTest (name, option, expectedSeparator) {
        var baseAssert = require('assert'),
            assert = empower(baseAssert, fakeFormatter, option);
        test(name, function () {
            var falsyNum = 0;
            try {
                eval(weave('assert(falsyNum);'));
            } catch (e) {
                baseAssert.equal(e.name, 'AssertionError');
                baseAssert.equal(e.message, [
                    '/path/to/some_test.js',
                    'assert(falsyNum);'
                ].join(expectedSeparator));
            }
        });
    }
    lineSeparatorTest('default is LF', {}, '\n');
    lineSeparatorTest('LF', {lineSeparator: '\n'}, '\n');
    lineSeparatorTest('CR', {lineSeparator: '\r'}, '\r');
    lineSeparatorTest('CRLF', {lineSeparator: '\r\n'}, '\r\n');
});


suite('assertion method with two arguments', function () {
    var baseAssert = require('assert'),
        assert = empower(baseAssert, fakeFormatter);

    test('both Identifier', function () {
        var foo = 'foo', bar = 'bar';
        try {
            eval(weave('assert.equal(foo, bar);'));
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
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            baseAssert.equal(e.message, [
                '/path/to/some_test.js',
                'assert.equal(foo, "bar");'
            ].join('\n'));
        }
    });
});
