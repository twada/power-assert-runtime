'use strict';

delete require.cache[require.resolve('..')];
var ContextTraversal = require('..');
var types = require('babel-types');
var baseAssert = require('assert');
var assert = require('../../../test_helper/empowered-assert');
var transpile = require('../../../test_helper/transpile');

describe('ContextTraversal of assert(foo === bar)', function () {
    function testTraversal (title, body) {
        it(title, function (done) {
            try {
                var foo = 'FOO';
                var bar = 'BAR';
                eval(transpile('assert(foo === bar)'));
            } catch (e) {
                var nodes = [];
                var traversal = new ContextTraversal(e.powerAssertContext);
                traversal.on('start', function (powerAssertContext) {
                    baseAssert(e.powerAssertContext === powerAssertContext);
                });
                traversal.on('data', function (esNode) {
                    nodes.push(esNode);
                });
                traversal.on('end', function () {
                    body(nodes);
                    done();
                });
                traversal.traverse();
            }
        });
    }

    testTraversal('number of EsNode', function (nodes) {
        baseAssert.equal(nodes.length, 5);
    });

    function testEsNodeAtIndex (index, prop, expected) {
        testTraversal(prop, function (nodes) {
            baseAssert.deepEqual(nodes[index][prop], expected);
        });
    }

    describe('root EsNode', function () {
        testEsNodeAtIndex(0, 'parent', null);
        testEsNodeAtIndex(0, 'espath', '');
        testEsNodeAtIndex(0, 'key', null);
        testEsNodeAtIndex(0, 'node', {
            type: 'CallExpression',
            callee: {
                type: 'Identifier',
                name: 'assert',
                range: [ 0, 6 ]
            },
            arguments: [
                {
                    type: 'BinaryExpression',
                    operator: '===',
                    left: {
                        type: 'Identifier',
                        name: 'foo',
                        range: [ 7, 10 ]
                    },
                    right: {
                        type: 'Identifier',
                        name: 'bar',
                        range: [ 15, 18 ]
                    },
                    range: [ 7, 18 ]
                }
            ],
            range: [ 0, 19 ]
        });
        testEsNodeAtIndex(0, 'code', 'assert(foo === bar)');
        testEsNodeAtIndex(0, 'value', undefined);
        testEsNodeAtIndex(0, 'isCaptured', false);
        testEsNodeAtIndex(0, 'range', [0, 19]);
    });

    describe('2nd EsNode', function () {
        testTraversal('parent', function (nodes) {
            baseAssert.deepEqual(nodes[1].parent, nodes[0]);
        });
        testEsNodeAtIndex(1, 'espath', 'callee');
        testEsNodeAtIndex(1, 'key', 'callee');
        testEsNodeAtIndex(1, 'node', {
            type: 'Identifier',
            name: 'assert',
            range: [ 0, 6 ]
        });
        testEsNodeAtIndex(1, 'code', 'assert');
        testEsNodeAtIndex(1, 'value', undefined);
        testEsNodeAtIndex(1, 'isCaptured', false);
        testEsNodeAtIndex(1, 'range', [0, 6]);
    });

    describe('3rd EsNode', function () {
        testTraversal('parent', function (nodes) {
            baseAssert.deepEqual(nodes[2].parent, nodes[0]);
        });
        testEsNodeAtIndex(2, 'espath', 'arguments/0');
        testEsNodeAtIndex(2, 'key', 0);
        testEsNodeAtIndex(2, 'node', {
            type: 'BinaryExpression',
            operator: '===',
            left: {
                type: 'Identifier',
                name: 'foo',
                range: [ 7, 10 ]
            },
            right: {
                type: 'Identifier',
                name: 'bar',
                range: [ 15, 18 ]
            },
            range: [ 7, 18 ]
        });
        testEsNodeAtIndex(2, 'code', 'foo === bar');
        testEsNodeAtIndex(2, 'value', false);
        testEsNodeAtIndex(2, 'isCaptured', true);
        testEsNodeAtIndex(2, 'range', [ 11, 14 ]);  // range of operator
    });

    describe('4th EsNode', function () {
        testTraversal('parent', function (nodes) {
            baseAssert.deepEqual(nodes[3].parent, nodes[2]);
        });
        testEsNodeAtIndex(3, 'espath', 'arguments/0/left');
        testEsNodeAtIndex(3, 'key', 'left');
        testEsNodeAtIndex(3, 'node', {
            type: 'Identifier',
            name: 'foo',
            range: [ 7, 10 ]
        });
        testEsNodeAtIndex(3, 'code', 'foo');
        testEsNodeAtIndex(3, 'value', 'FOO');
        testEsNodeAtIndex(3, 'isCaptured', true);
        testEsNodeAtIndex(3, 'range', [ 7, 10 ]);
    });

    describe('5th EsNode', function () {
        testTraversal('parent', function (nodes) {
            baseAssert.deepEqual(nodes[4].parent, nodes[2]);
        });
        testEsNodeAtIndex(4, 'espath', 'arguments/0/right');
        testEsNodeAtIndex(4, 'key', 'right');
        testEsNodeAtIndex(4, 'node', {
            type: 'Identifier',
            name: 'bar',
            range: [ 15, 18 ]
        });
        testEsNodeAtIndex(4, 'code', 'bar');
        testEsNodeAtIndex(4, 'value', 'BAR');
        testEsNodeAtIndex(4, 'isCaptured', true);
        testEsNodeAtIndex(4, 'range', [ 15, 18 ]);
    });
});

describe('powerAssertContext structure', function () {

    it('assert(foo === bar)', function () {
        try {
            var foo = 'FOO';
            var bar = 'BAR';
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
            });
        }
    });

    it('assert.equal(foo, bar)', function () {
        try {
            var foo = 'FOO';
            var bar = 'BAR';
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
                        value: "FOO",
                        events: [
                            {
                                value: "FOO",
                                espath: "arguments/0"
                            }
                        ]
                    },
                    {
                        value: "BAR",
                        events: [
                            {
                                value: "BAR",
                                espath: "arguments/1"
                            }
                        ]
                    }
                ]
            });
        }
    });
});
