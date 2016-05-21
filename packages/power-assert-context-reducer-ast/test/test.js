'use strict';

var assert = require('assert');
var estraverse = require('estraverse');
delete require.cache[require.resolve('..')];
var filter = require('..');

describe('power-assert-context-reducer-ast', function () {

    it('add parsed AST, tokens and visitor keys into output', function () {
        var input = {
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
        var inputClone = JSON.parse(JSON.stringify(input));
        var originalSource = input.source;

        var actual = filter(input);
        assert(actual !== input);
        assert(originalSource === input.source);
        assert.notDeepEqual(actual, input);
        assert.deepEqual(input, inputClone);

        var expected = {
            source: {
                content: 'assert(foo === bar)',
                filepath: 'test/some_test.js',
                line: 1,
                ast: '{"type":"CallExpression","callee":{"type":"Identifier","name":"assert","range":[0,6]},"arguments":[{"type":"BinaryExpression","operator":"===","left":{"type":"Identifier","name":"foo","range":[7,10]},"right":{"type":"Identifier","name":"bar","range":[15,18]},"range":[7,18]}],"range":[0,19]}',
                tokens: '[{"type":{"label":"name"},"value":"assert","range":[0,6]},{"type":{"label":"("},"range":[6,7]},{"type":{"label":"name"},"value":"foo","range":[7,10]},{"type":{"label":"==/!="},"value":"===","range":[11,14]},{"type":{"label":"name"},"value":"bar","range":[15,18]},{"type":{"label":")"},"range":[18,19]}]',
                visitorKeys: JSON.stringify(estraverse.VisitorKeys)
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
