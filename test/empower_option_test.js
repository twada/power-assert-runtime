var q = require('../test_helper').QUnit,
    instrument = require('../test_helper').instrument,
    formatter = require('../lib/power-assert-formatter'),
    enhance = require('../lib/empower').enhance,
    powerAssertTextLines = [],
    assert = enhance(q.assert, formatter, function (context, message) {
        powerAssertTextLines = formatter.format(context);
    }),
    espower = require('espower'),
    esprima = require('esprima');

q.module('path option', {
    setup: function () {
        powerAssertTextLines.length = 0;
    }
});

q.test('when path option is undefined', function () {
    var falsyStr = '';
    assert.ok(eval(instrument('assert(falsyStr);', {destructive: false, source: 'assert(falsyStr);', powerAssertVariableName: 'assert'})));
    q.deepEqual(powerAssertTextLines, [
        '# at line: 1',
        '',
        'assert(falsyStr);',
        '       |         ',
        '       ""        ',
        ''
    ]);
});

q.test('when path option is provided', function () {
    var falsyStr = '';
    assert.ok(eval(instrument('assert(falsyStr);', {destructive: false, source: 'assert(falsyStr);', path: '/path/to/source.js', powerAssertVariableName: 'assert'})));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/source.js:1',
        '',
        'assert(falsyStr);',
        '       |         ',
        '       ""        ',
        ''
    ]);
});
