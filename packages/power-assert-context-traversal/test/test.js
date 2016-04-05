'use strict';

delete require.cache[require.resolve('..')];
var ContextTraversal = require('..');
var types = require('babel-types');
var baseAssert = require('assert');
var assert = require('../../../test_helper/empowered-assert');
var transpile = require('../../../test_helper/transpile');

describe('ContextTraversal', function () {
    it('assert(foo === bar)', function (done) {
        try {
            var foo = 'foo';
            var bar = 'bar';
            eval(transpile('assert(foo === bar)'));
        } catch (e) {
            var traversal = new ContextTraversal(e.powerAssertContext);
            traversal.on('start', function (powerAssertContext) {
                baseAssert(e.powerAssertContext === powerAssertContext);
            });
            var nodes = [];
            traversal.on('data', function (esNode) {
                nodes.push(esNode);
            });
            traversal.on('end', function () {
                baseAssert.equal(nodes.length, 5);
                done();
            });
            traversal.traverse();
        }
    });
});

describe('powerAssertContext structure', function () {

    it('assert(foo === bar)', function () {
        try {
            var foo = 'foo';
            var bar = 'bar';
            eval(transpile('assert(foo === bar)'));
        } catch (e) {
            baseAssert.deepEqual(e.powerAssertContext, {
                source: {
                    content: 'assert(foo === bar)',
                    filepath: 'test/some_test.js',
                    line: 1,
                    ast: '{"type":"CallExpression","callee":{"type":"Identifier","name":"assert","range":[0,6]},"arguments":[{"type":"BinaryExpression","operator":"===","left":{"type":"Identifier","name":"foo","range":[7,10]},"right":{"type":"Identifier","name":"bar","range":[15,18]},"range":[7,18]}],"range":[0,19]}',
                    tokens: '[{"type":{"label":"name"},"value":"assert","range":[0,6]},{"type":{"label":"("},"range":[6,7]},{"type":{"label":"name"},"value":"foo","range":[7,10]},{"type":{"label":"==/!="},"value":"===","range":[11,14]},{"type":{"label":"name"},"value":"bar","range":[15,18]},{"type":{"label":")"},"range":[18,19]}]',
                    visitorKeys: JSON.stringify(types.VISITOR_KEYS)
                },
                args: [
                    {
                        value: false,
                        events: [
                            {
                                value: "foo",
                                espath: "arguments/0/left"
                            },
                            {
                                value: "bar",
                                espath: "arguments/0/right"
                            },
                            {
                                value: false,
                                espath: "arguments/0"
                            }
                        ]
                    }
                ]
            });
        }
    });

    it('assert.equal(foo, bar)', function () {
        try {
            var foo = 'foo';
            var bar = 'bar';
            eval(transpile('assert.equal(foo, bar)'));
        } catch (e) {
            baseAssert.deepEqual(e.powerAssertContext, {
                source: {
                    content: "assert.equal(foo, bar)",
                    filepath: "test/some_test.js",
                    line: 1,
                    ast: '{"type":"CallExpression","callee":{"type":"MemberExpression","object":{"type":"Identifier","name":"assert","range":[0,6]},"property":{"type":"Identifier","name":"equal","range":[7,12]},"computed":false,"range":[0,12]},"arguments":[{"type":"Identifier","name":"foo","range":[13,16]},{"type":"Identifier","name":"bar","range":[18,21]}],"range":[0,22]}',
                    tokens: '[{"type":{"label":"name"},"value":"assert","range":[0,6]},{"type":{"label":"."},"range":[6,7]},{"type":{"label":"name"},"value":"equal","range":[7,12]},{"type":{"label":"("},"range":[12,13]},{"type":{"label":"name"},"value":"foo","range":[13,16]},{"type":{"label":","},"range":[16,17]},{"type":{"label":"name"},"value":"bar","range":[18,21]},{"type":{"label":")"},"range":[21,22]}]',
                    visitorKeys: JSON.stringify(types.VISITOR_KEYS)
                },
                args: [
                    {
                        value: "foo",
                        events: [
                            {
                                value: "foo",
                                espath: "arguments/0"
                            }
                        ]
                    },
                    {
                        value: "bar",
                        events: [
                            {
                                value: "bar",
                                espath: "arguments/1"
                            }
                        ]
                    }
                ]
            });
        }
    });
});
