'use strict';

var BaseRenderer = require('power-assert-renderer-base');
var inherits = require('util').inherits;
var literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;

function isLiteral (node) {
    return literalPattern.test(node.type);
}

function ComparisonReducer () {
    BaseRenderer.call(this);
    this.binexp = null;
}
inherits(ComparisonReducer, BaseRenderer);

ComparisonReducer.prototype.onStart = function (context) {
    this.context = context;
};

ComparisonReducer.prototype.onData = function (esNode) {
    if (isTargetBinaryExpression(esNode)) {
        this.binexp = {
            operator: esNode.node.operator,
            value: esNode.value
        };
    }
    if (this.binexp && isTargetBinaryExpression(esNode.parent)) {
        if (esNode.isCaptured || isLiteral(esNode.node)) {
            this.binexp[esNode.key] = {code: esNode.code, value: esNode.value};
        }
    }
};

ComparisonReducer.prototype.onEnd = function () {
    if (this.binexp && this.binexp.left && this.binexp.right) {
        this.context.actual = this.binexp.left.value;
        this.context.expected = this.binexp.right.value;
        this.context.operator = this.binexp.operator;
    }
};

function isTargetBinaryExpression (esNode) {
    return esNode &&
        esNode.espath === 'arguments/0' &&
        esNode.node.type === 'BinaryExpression' &&
        esNode.isCaptured &&
        !(esNode.value);
}

module.exports = ComparisonReducer;
