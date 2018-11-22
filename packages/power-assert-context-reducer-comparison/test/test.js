'use strict';

delete require.cache[require.resolve('..')];
var ComparisonReducer = require('..');
var createFormatter = require('power-assert-context-formatter');
var baseAssert = require('assert');
var assert = require('../../../test_helper/empowered-assert');
var transpile = require('../../../test_helper/transpile');

describe('ComparisonReducer', function () {

    it('add `expected`, `actual` and `operator` to powerAssertContext', function () {
        var format = createFormatter({
            renderers: [
                ComparisonReducer
            ]
        });
        try {
            var foo = 'FOO';
            var bar = 'BAR';
            eval(transpile('assert(foo === bar)'));
        } catch (e) {
            baseAssert(e.powerAssertContext.expected === undefined);
            baseAssert(e.powerAssertContext.actual === undefined);
            baseAssert(e.powerAssertContext.operator === undefined);
            format(e.powerAssertContext);
            baseAssert(e.powerAssertContext.expected === 'BAR');
            baseAssert(e.powerAssertContext.actual === 'FOO');
            baseAssert(e.powerAssertContext.operator === '===');
        }
    });

    it('affects only for top-level BinaryExpression', function () {
        var format = createFormatter({
            renderers: [
                ComparisonReducer
            ]
        });
        try {
            var foo = 'FOO';
            var bar = 'BAR';
            eval(transpile('assert(!(foo === bar))'));
        } catch (e) {
            baseAssert(e.powerAssertContext.expected === undefined);
            baseAssert(e.powerAssertContext.actual === undefined);
            baseAssert(e.powerAssertContext.operator === undefined);
            format(e.powerAssertContext);
            baseAssert(e.powerAssertContext.expected === undefined);
            baseAssert(e.powerAssertContext.actual === undefined);
            baseAssert(e.powerAssertContext.operator === undefined);
        }
    });

});

