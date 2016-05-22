'use strict';

var assert = require('assert');
var estraverse = require('estraverse');
delete require.cache[require.resolve('..')];
var reduce = require('..');

describe('power-assert-context-reducer-ast', function () {
    beforeEach(function () {
        this.input = {
            source: {
                content: 'assert(foo === bar)',
                filepath: 'test/some_test.js',
                line: 1
            },
            args: [
                {
                    value: false,
                    events: [
                        {
                            value: "FOO",
                            espath: "arguments/0/left"
                        },
                        {
                            value: "BAR",
                            espath: "arguments/0/right"
                        },
                        {
                            value: false,
                            espath: "arguments/0"
                        }
                    ]
                }
            ]
        };
    });

    it('new context is not deeply equal to original', function () {
        var actual = reduce(this.input);
        assert.notDeepEqual(actual, this.input);
    });

    it('original context should not be changed', function () {
        var inputClone = JSON.parse(JSON.stringify(this.input));
        reduce(this.input);
        assert.deepEqual(this.input, inputClone);
    });

    it('returns new context', function () {
        var actual = reduce(this.input);
        assert(actual !== this.input);
    });

    it('original context reference should not be changed', function () {
        var originalSource = this.input.source;
        reduce(this.input);
        assert(originalSource === this.input.source);
    });

    it('add parsed AST, tokens and visitor keys into output', function () {
        var actual = reduce(this.input);
        var expected = {
            source: {
                content: 'assert(foo === bar)',
                filepath: 'test/some_test.js',
                line: 1,
                ast: JSON.parse('{"type":"CallExpression","callee":{"type":"Identifier","name":"assert","range":[0,6]},"arguments":[{"type":"BinaryExpression","operator":"===","left":{"type":"Identifier","name":"foo","range":[7,10]},"right":{"type":"Identifier","name":"bar","range":[15,18]},"range":[7,18]}],"range":[0,19]}'),
                tokens: JSON.parse('[{"type":{"label":"name"},"value":"assert","range":[0,6]},{"type":{"label":"("},"range":[6,7]},{"type":{"label":"name"},"value":"foo","range":[7,10]},{"type":{"label":"==/!="},"value":"===","range":[11,14]},{"type":{"label":"name"},"value":"bar","range":[15,18]},{"type":{"label":")"},"range":[18,19]}]'),
                visitorKeys: estraverse.VisitorKeys
            },
            args: [
                {
                    value: false,
                    events: [
                        {
                            value: "FOO",
                            espath: "arguments/0/left"
                        },
                        {
                            value: "BAR",
                            espath: "arguments/0/right"
                        },
                        {
                            value: false,
                            espath: "arguments/0"
                        }
                    ]
                }
            ]
        };
        assert.deepEqual(actual, expected);
    });
});
