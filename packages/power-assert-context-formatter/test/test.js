'use strict';

delete require.cache[require.resolve('..')];
var createFormatter = require('..');
var AssertionRenderer = require('power-assert-renderer-assertion');
var DiagramRenderer = require('power-assert-renderer-diagram');
var baseAssert = require('assert');
var assert = require('../../../test_helper/empowered-assert');
var transpile = require('../../../test_helper/transpile');

describe('power-assert-context-formatter', function () {

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
