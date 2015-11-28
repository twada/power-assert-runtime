(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['empower-core', 'assert'], factory);
    } else if (typeof exports === 'object') {
        factory(require('..'), require('assert'));
    } else {
        factory(root.empowerCore, root.assert);
    }
}(this, function (
    empower,
    baseAssert
) {

suite('not-espowered: ', function () {

var assert = empower(baseAssert);

test('argument is null Literal.', function () {
    var foo = 'foo';
    try {
        eval('assert.equal(foo, null);');
        assert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert.equal(e.name, 'AssertionError');
        baseAssert((e.message === '\'foo\' == null' || e.message === '\"foo\" == null'));
        baseAssert(e.powerAssertContext === undefined);
    }
});


test('empowered function also acts like an assert function', function () {
    var falsy = 0;
    try {
        eval('assert(falsy);');
        assert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert.equal(e.name, 'AssertionError');
        baseAssert.equal(e.message, '0 == true');
        baseAssert(e.powerAssertContext === undefined);
    }
});


suite('assertion method with one argument', function () {
    test('Identifier', function () {
        var falsy = 0;
        try {
            eval('assert.ok(falsy);');
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            baseAssert.equal(e.message, '0 == true');
            baseAssert(e.powerAssertContext === undefined);
        }
    });
});


suite('assertion method with two arguments', function () {
    test('both Identifier', function () {
        var foo = 'foo', bar = 'bar';
        try {
            eval('assert.equal(foo, bar);');
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            baseAssert((e.message === '\'foo\' == \'bar\'' || e.message === '\"foo\" == \"bar\"'));
            baseAssert(e.powerAssertContext === undefined);
        }
    });

    test('first argument is Literal', function () {
        var bar = 'bar';
        try {
            eval('assert.equal("foo", bar);');
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            baseAssert((e.message === '\'foo\' == \'bar\'' || e.message === '\"foo\" == \"bar\"'));
            baseAssert(e.powerAssertContext === undefined);
        }
    });

    test('second argument is Literal', function () {
        var foo = 'foo';
        try {
            eval('assert.equal(foo, "bar");');
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.name, 'AssertionError');
            baseAssert((e.message === '\'foo\' == \'bar\'' || e.message === '\"foo\" == \"bar\"'));
            baseAssert(e.powerAssertContext === undefined);
        }
    });
});

});

}));
