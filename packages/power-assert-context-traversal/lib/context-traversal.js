'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var estraverse = require('estraverse');
var forEach = require('array-foreach');
var reduce = require('array-reduce');
var EsNode = require('./esnode');

function ContextTraversal (powerAssertContext) {
    this.powerAssertContext = powerAssertContext;
    EventEmitter.call(this);
}
inherits(ContextTraversal, EventEmitter);

ContextTraversal.prototype.traverse = function () {
    var _this = this;
    _this.emit('start', this.powerAssertContext);
    forEach(this.powerAssertContext.args, function (capturedArgument) {
        onEachEsNode(capturedArgument, _this.powerAssertContext.source, function (esNode) {
            _this.emit('data', esNode);
        });
    });
    _this.emit('end');
};

function onEachEsNode(capturedArgument, source, callback) {
    var ast = JSON.parse(source.ast);
    var tokens = JSON.parse(source.tokens);
    var visitorKeys = JSON.parse(source.visitorKeys);
    var espathToValue = reduce(capturedArgument.events, function (accum, ev) {
        accum[ev.espath] = ev.value;
        return accum;
    }, {});
    var nodeStack = [];
    estraverse.traverse(ast, {
        keys: visitorKeys,
        enter: function (currentNode, parentNode) {
            var esNode = new EsNode(this.path(), currentNode, parentNode, espathToValue, source.content, tokens);
            if (1 < nodeStack.length) {
                esNode.parent = nodeStack[nodeStack.length - 1];
            }
            nodeStack.push(esNode);
            callback(esNode);
        },
        leave: function (currentNode, parentNode) {
            nodeStack.pop();
        }
    });
}

module.exports = ContextTraversal;
