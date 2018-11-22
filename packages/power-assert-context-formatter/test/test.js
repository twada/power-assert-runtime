'use strict';

delete require.cache[require.resolve('..')];
var createFormatter = require('..');
var AstReducer = require('power-assert-context-reducer-ast');
var AssertionRenderer = require('power-assert-renderer-assertion');
var DiagramRenderer = require('power-assert-renderer-diagram');
var baseAssert = require('assert');
var assert = require('../../../test_helper/empowered-assert');
var transpile = require('../../../test_helper/transpile');
var appendAst = require('power-assert-context-reducer-ast');


describe('power-assert-context-formatter : pipeline option', function () {

    it('bare constructors, without options', function () {
        var format = createFormatter({
            pipeline: [
                AstReducer,
                AssertionRenderer,
                DiagramRenderer
            ]
        });
        try {
            var foo = { name: 'foo', items: ['one', 'two'] };
            var bar = { name: 'bar', items: ['toto', 'tata'] };
            eval(transpile('assert.deepEqual(foo, bar)'));
        } catch (e) {
            var result = format(e.powerAssertContext);
            baseAssert.equal(result, [
                '  ',
                '  assert.deepEqual(foo, bar)',
                '                   |    |   ',
                '                   |    Object{name:"bar",items:["toto","tata"]}',
                '                   Object{name:"foo",items:["one","two"]}',
                '  '
            ].join('\n'));
        }
    });

    it('constructors with options', function () {
        var format = createFormatter({
            pipeline: [
                { ctor: AstReducer },
                { ctor: AssertionRenderer },
                { ctor: DiagramRenderer, options: { maxDepth: 2 } }
            ]
        });
        try {
            var foo = { name: 'foo', items: ['one', 'two'] };
            var bar = { name: 'bar', items: ['toto', 'tata'] };
            eval(transpile('assert.deepEqual(foo, bar)'));
        } catch (e) {
            var result = format(e.powerAssertContext);
            baseAssert.equal(result, [
                '  ',
                '  assert.deepEqual(foo, bar)',
                '                   |    |   ',
                '                   |    Object{name:"bar",items:["toto","tata"]}',
                '                   Object{name:"foo",items:["one","two"]}',
                '  '
            ].join('\n'));
        }
    });

    it('append ast reducer', function () {
        var format = createFormatter({
            pipeline: [
                AstReducer,
                AssertionRenderer,
                DiagramRenderer
            ]
        });
        try {
            var foo = { name: 'foo', items: ['one', 'two'] };
            var bar = { name: 'bar', items: ['toto', 'tata'] };
            eval(transpile('assert.deepEqual(foo, bar)', false));
        } catch (e) {
            baseAssert(e.powerAssertContext.source !== undefined);
            baseAssert(e.powerAssertContext.source.ast === undefined);
            baseAssert(e.powerAssertContext.source.tokens === undefined);
            baseAssert(e.powerAssertContext.source.visitorKeys === undefined);
            var result = format(e.powerAssertContext);
            baseAssert(e.powerAssertContext.source.ast !== undefined);
            baseAssert(e.powerAssertContext.source.tokens !== undefined);
            baseAssert(e.powerAssertContext.source.visitorKeys !== undefined);
            baseAssert.equal(result, [
                '  ',
                '  assert.deepEqual(foo, bar)',
                '                   |    |   ',
                '                   |    Object{name:"bar",items:["toto","tata"]}',
                '                   Object{name:"foo",items:["one","two"]}',
                '  '
            ].join('\n'));
        }
    });

    it('degrade gracefully when there are some parse errors caused by not supported syntax', function () {
        var format = createFormatter({
            pipeline: [
                AstReducer,
                AssertionRenderer,
                DiagramRenderer
            ]
        });
        function validate(name) {
            return {
                name: name,
                valid: true,
                value: this
            };
        }
        try {
            eval(transpile('assert.deepEqual(true::validate("foo"), { valid: true, value: true, name: "bar" })', false));
        } catch (e) {
            var result = format(e.powerAssertContext);
            baseAssert.equal(result, [
                '  ',
                '  assert.deepEqual(true::validate("foo"), { valid: true, value: true, name: "bar" })',
                '                       ?                                                            ',
                '                       ?                                                            ',
                '                       SyntaxError: Unexpected token (1:21)                         ',
                '                                                                                    ',
                '  If you are using `babel-plugin-espower` and want to use experimental syntax in your assert(), you should set `embedAst` option to true.',
                '  see: https://github.com/power-assert-js/babel-plugin-espower#optionsembedast      ',
                '                                                                                    ',
                '                                                                                    ',
                '  '
            ].join('\n'));
        }
    });

});


describe('power-assert-context-formatter : outputOffset option', function () {

    it('default is 2', function () {
        var format = createFormatter({
            pipeline: [
                AstReducer,
                AssertionRenderer
            ]
        });
        try {
            var foo = 'foo';
            var bar = 'bar';
            eval(transpile('assert(foo === bar)'));
        } catch (e) {
            var result = format(e.powerAssertContext);
            baseAssert.equal(result, [
                '  ',
                '  assert(foo === bar)',
                '  '
            ].join('\n'));
        }
    });

    it('when 0', function () {
        var format = createFormatter({
            outputOffset: 0,
            pipeline: [
                AstReducer,
                AssertionRenderer
            ]
        });
        try {
            var foo = 'foo';
            var bar = 'bar';
            eval(transpile('assert(foo === bar)'));
        } catch (e) {
            var result = format(e.powerAssertContext);
            baseAssert.equal(result, [
                '',
                'assert(foo === bar)',
                ''
            ].join('\n'));
        }
    });
});


describe('power-assert-context-formatter : lineSeparator option', function () {
    function lineSeparatorTest (name, option, expectedSeparator) {
        it(name, function () {
            var format = createFormatter(Object.assign({
                outputOffset: 0,
                pipeline: [
                    AstReducer,
                    AssertionRenderer
                ]
            }, option));
            try {
                var foo = 'foo';
                eval(transpile('assert(foo === "bar")'));
            } catch (e) {
                var result = format(e.powerAssertContext);
                baseAssert.equal(result, [
                    '',
                    'assert(foo === "bar")',
                    ''
                ].join(expectedSeparator));
                baseAssert(/^AssertionError/.test(e.name));
            }
        });
    }
    lineSeparatorTest('default is LF', {}, '\n');
    lineSeparatorTest('LF', {lineSeparator: '\n'}, '\n');
    lineSeparatorTest('CR', {lineSeparator: '\r'}, '\r');
    lineSeparatorTest('CRLF', {lineSeparator: '\r\n'}, '\r\n');
});
