'use strict';

delete require.cache[require.resolve('..')];
var createFormatter = require('..');
var AssertionRenderer = require('power-assert-renderer-assertion');
var DiagramRenderer = require('power-assert-renderer-diagram');
var baseAssert = require('assert');
var assert = require('../../../test_helper/empowered-assert');
var transpile = require('../../../test_helper/transpile');

describe('power-assert-context-formatter', function () {
    it('assert(foo === bar)', function () {
        var format = createFormatter({
            renderers: [
                AssertionRenderer,
                DiagramRenderer
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
                '         |   |   |   ',
                '         |   |   "bar"',
                '         |   false   ',
                '         "foo"       ',
                '  '
            ].join('\n'));
        }
    });
});
