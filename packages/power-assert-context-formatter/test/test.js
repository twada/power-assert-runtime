'use strict';

delete require.cache[require.resolve('..')];
var createFormatter = require('..');
var AssertionRenderer = require('power-assert-renderer-assertion');
var DiagramRenderer = require('power-assert-renderer-diagram');
var baseAssert = require('assert');
var assert = require('../../../test_helper/empowered-assert');
var transpile = require('../../../test_helper/transpile');
var extend = require('xtend');
var appendAst = require('power-assert-context-reducer-ast');


describe('power-assert-context-formatter : renderers option', function () {

    it('bare constructors, without options', function () {
        var format = createFormatter({
            renderers: [
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
                '                   |    Object{name:"bar",items:#Array#}',
                '                   Object{name:"foo",items:#Array#}',
                '  '
            ].join('\n'));
        }
    });

    it('constructors with options', function () {
        var format = createFormatter({
            renderers: [
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
});


describe('power-assert-context-formatter : reducers option', function () {

    it('append ast reducer', function () {
        var format = createFormatter({
            reducers: [
                appendAst
            ],
            renderers: [
                AssertionRenderer,
                DiagramRenderer
            ]
        });
        try {
            var foo = { name: 'foo', items: ['one', 'two'] };
            var bar = { name: 'bar', items: ['toto', 'tata'] };
            eval(transpile('assert.deepEqual(foo, bar)', false));
        } catch (e) {
            var result = format(e.powerAssertContext);
            baseAssert.equal(result, [
                '  ',
                '  assert.deepEqual(foo, bar)',
                '                   |    |   ',
                '                   |    Object{name:"bar",items:#Array#}',
                '                   Object{name:"foo",items:#Array#}',
                '  '
            ].join('\n'));
        }
    });

});


describe('power-assert-context-formatter : outputOffset option', function () {

    it('default is 2', function () {
        var format = createFormatter({
            renderers: [ AssertionRenderer ]
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
            renderers: [ AssertionRenderer ]
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
            var format = createFormatter(extend({
                outputOffset: 0,
                renderers: [ AssertionRenderer ]
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
                baseAssert.equal(e.name, 'AssertionError');
            }
        });
    }
    lineSeparatorTest('default is LF', {}, '\n');
    lineSeparatorTest('LF', {lineSeparator: '\n'}, '\n');
    lineSeparatorTest('CR', {lineSeparator: '\r'}, '\r');
    lineSeparatorTest('CRLF', {lineSeparator: '\r\n'}, '\r\n');
});
