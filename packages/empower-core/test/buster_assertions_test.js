'use strict';

var empower = require('..');
var espower = require('espower');
var acorn = require('acorn');
var escodegen = require('escodegen');
var baseAssert = require('assert');
var busterAssertions = require('buster-assertions');

    var weave = function (line) {
        var filepath = '/absolute/path/to/project/test/some_test.js';
        var espowerOptions = {
            source: line,
            path: filepath,
            sourceRoot: '/absolute/path/to/project/',
            destructive: true,
            patterns: [
                'assert(actual, [message])',
                'assert.isNull(object, [message])',
                'assert.same(actual, expected, [message])',
                'assert.near(actual, expected, delta, [message])'
            ]
        };
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

    var assert = empower(busterAssertions.assert, {
        modifyMessageBeforeAssert: function (ev) {
            var message = ev.originalMessage;
            var powerAssertText = fakeFormatter(ev.powerAssertContext);
            return message ? message + ' ' + powerAssertText : powerAssertText;
        },
        patterns: [
            'assert(actual, [message])',
            'assert.isNull(object, [message])',
            'assert.same(actual, expected, [message])',
            'assert.near(actual, expected, delta, [message])'
        ]
    });


    it('buster assertion is also an assert function', function () {
        var falsy = 0;
        try {
            eval(weave('assert(falsy);'));
            baseAssert.ok(false, 'AssertionError should be thrown');
        } catch (e) {
            baseAssert.equal(e.message, [
                'test/some_test.js',
                'assert(falsy)',
                '[{"value":0,"espath":"arguments/0"}]'
            ].join('\n'));
            baseAssert(/^AssertionError/.test(e.name));
        }
    });


    describe('buster assertion with one argument', function () {
        it('isNull method', function () {
            var falsy = 0;
            try {
                eval(weave('assert.isNull(falsy);'));
                baseAssert.ok(false, 'AssertionError should be thrown');
            } catch (e) {
                baseAssert.equal(e.message, [
                    '[assert.isNull] test/some_test.js',
                    'assert.isNull(falsy)',
                    '[{"value":0,"espath":"arguments/0"}]: Expected 0 to be null'
                ].join('\n'));
                baseAssert(/^AssertionError/.test(e.name));
            }
        });
    });


    describe('buster assertion method with two arguments', function () {
        it('both Identifier', function () {
            var foo = 'foo', bar = 'bar';
            try {
                eval(weave('assert.same(foo, bar);'));
                baseAssert.ok(false, 'AssertionError should be thrown');
            } catch (e) {
                baseAssert.equal(e.message, [
                    '[assert.same] test/some_test.js',
                    'assert.same(foo, bar)',
                    '[{"value":"foo","espath":"arguments/0"},{"value":"bar","espath":"arguments/1"}]: foo expected to be the same object as bar'
                ].join('\n'));
                baseAssert(/^AssertionError/.test(e.name));
            }
        });

        it('first argument is Literal', function () {
            var bar = 'bar';
            try {
                eval(weave('assert.same("foo", bar);'));
                baseAssert.ok(false, 'AssertionError should be thrown');
            } catch (e) {
                baseAssert.equal(e.message, [
                    '[assert.same] test/some_test.js',
                    'assert.same("foo", bar)',
                    '[{"value":"bar","espath":"arguments/1"}]: foo expected to be the same object as bar'
                ].join('\n'));
                baseAssert(/^AssertionError/.test(e.name));
            }
        });

        it('second argument is Literal', function () {
            var foo = 'foo';
            try {
                eval(weave('assert.same(foo, "bar");'));
                baseAssert.ok(false, 'AssertionError should be thrown');
            } catch (e) {
                baseAssert.equal(e.message, [
                    '[assert.same] test/some_test.js',
                    'assert.same(foo, "bar")',
                    '[{"value":"foo","espath":"arguments/0"}]: foo expected to be the same object as bar'
                ].join('\n'));
                baseAssert(/^AssertionError/.test(e.name));
            }
        });
    });


    describe('buster assertion method with three arguments', function () {
        it('when every argument is Identifier', function () {
            var actualVal = 10.6, expectedVal = 10, delta = 0.5;
            try {
                eval(weave('assert.near(actualVal, expectedVal, delta);'));
                baseAssert.ok(false, 'AssertionError should be thrown');
            } catch (e) {
                baseAssert.equal(e.message, [
                    '[assert.near] test/some_test.js',
                    'assert.near(actualVal, expectedVal, delta)',
                    '[{"value":10.6,"espath":"arguments/0"},{"value":10,"espath":"arguments/1"},{"value":0.5,"espath":"arguments/2"}]: Expected 10.6 to be equal to 10 +/- 0.5'
                ].join('\n'));
                baseAssert(/^AssertionError/.test(e.name));
            }
        });

        it('optional fourth argument', function () {
            var actualVal = 10.6, expectedVal = 10, delta = 0.5, messageStr = 'not in delta';
            try {
                eval(weave('assert.near(actualVal, expectedVal, delta, messageStr);'));
                baseAssert.ok(false, 'AssertionError should be thrown');
            } catch (e) {
                baseAssert.equal(e.message, [
                    '[assert.near] not in delta test/some_test.js',
                    'assert.near(actualVal, expectedVal, delta, messageStr)',
                    '[{"value":10.6,"espath":"arguments/0"},{"value":10,"espath":"arguments/1"},{"value":0.5,"espath":"arguments/2"}]: Expected 10.6 to be equal to 10 +/- 0.5'
                ].join('\n'));
                baseAssert(/^AssertionError/.test(e.name));
            }
        });
    });
