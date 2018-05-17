'use strict';

var empower = require('..');
var baseAssert = require('assert');

describe('not-espowered: ', function () {

var assert = empower(baseAssert);

it('argument is null Literal.', function () {
    var foo = 'foo';
    try {
        eval('assert.equal(foo, null);');
        assert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert(/^AssertionError/.test(e.name));
        baseAssert((e.message === '\'foo\' == null' || e.message === '\"foo\" == null'));
        baseAssert(e.powerAssertContext === undefined);
    }
});


it('empowered function also acts like an assert function', function () {
    var falsy = 0;
    try {
        eval('assert(falsy);');
        assert.ok(false, 'AssertionError should be thrown');
    } catch (e) {
        baseAssert(/^AssertionError/.test(e.name));
        baseAssert.equal(e.message, '0 == true');
        baseAssert(e.powerAssertContext === undefined);
    }
});


describe('assertion method with one argument', function () {
    it('Identifier', function () {
        var falsy = 0;
        try {
            eval('assert.ok(falsy);');
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert(/^AssertionError/.test(e.name));
            baseAssert.equal(e.message, '0 == true');
            baseAssert(e.powerAssertContext === undefined);
        }
    });
});


describe('assertion method with two arguments', function () {
    it('both Identifier', function () {
        var foo = 'foo', bar = 'bar';
        try {
            eval('assert.equal(foo, bar);');
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert(/^AssertionError/.test(e.name));
            baseAssert((e.message === '\'foo\' == \'bar\'' || e.message === '\"foo\" == \"bar\"'));
            baseAssert(e.powerAssertContext === undefined);
        }
    });

    it('first argument is Literal', function () {
        var bar = 'bar';
        try {
            eval('assert.equal("foo", bar);');
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert(/^AssertionError/.test(e.name));
            baseAssert((e.message === '\'foo\' == \'bar\'' || e.message === '\"foo\" == \"bar\"'));
            baseAssert(e.powerAssertContext === undefined);
        }
    });

    it('second argument is Literal', function () {
        var foo = 'foo';
        try {
            eval('assert.equal(foo, "bar");');
            assert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert(/^AssertionError/.test(e.name));
            baseAssert((e.message === '\'foo\' == \'bar\'' || e.message === '\"foo\" == \"bar\"'));
            baseAssert(e.powerAssertContext === undefined);
        }
    });
});

});
