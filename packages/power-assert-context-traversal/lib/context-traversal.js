'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var estraverse = require('estraverse');
var forEach = require('array-foreach');
var reduce = require('array-reduce');
var locationOf = require('./location');
var literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;

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
            var esNode = createEsNode(this.path(), currentNode, parentNode, espathToValue, source.content, tokens, nodeStack);
            nodeStack.push(esNode);
            callback(esNode);
        },
        leave: function (currentNode, parentNode) {
            nodeStack.pop();
        }
    });
}

function isLiteral (node) {
    return literalPattern.test(node.type);
}

function createEsNode (path, currentNode, parentNode, espathToValue, jsCode, tokens, nodeStack) {
    var espath = path ? path.join('/') : '';
    return {
        espath: espath,
        parent: (1 < nodeStack.length) ? nodeStack[nodeStack.length - 1] : null,
        parentEspath: path ? path.slice(0, path.length - 1).join('/') : '',
        currentProp: path ? path[path.length - 1] : null,
        currentNode: currentNode,
        parentNode: parentNode,
        range: locationOf(currentNode, tokens),
        code: jsCode.slice(currentNode.range[0], currentNode.range[1]),
        isCaptured: espathToValue.hasOwnProperty(espath),
        value: isLiteral(currentNode) ? currentNode.value : espathToValue[espath]
    };
}

module.exports = ContextTraversal;
