'use strict';

const BaseRenderer = require('power-assert-renderer-base');
const literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;
const isLiteral = (node) => literalPattern.test(node.type);

class ComparisonReducer extends BaseRenderer {
  constructor () {
    super();
    this.binexp = null;
  }
  onStart (context) {
    this.context = context;
  }
  onData (esNode) {
    if (isTargetBinaryExpression(esNode)) {
      this.binexp = {
        operator: esNode.node.operator,
        value: esNode.value
      };
    }
    if (this.binexp && isTargetBinaryExpression(esNode.parent)) {
      if (esNode.isCaptured || isLiteral(esNode.node)) {
        this.binexp[esNode.key] = { code: esNode.code, value: esNode.value };
      }
    }
  }
  onEnd () {
    if (this.binexp && this.binexp.left && this.binexp.right) {
      this.context.actual = this.binexp.left.value;
      this.context.expected = this.binexp.right.value;
      this.context.operator = this.binexp.operator;
    }
  }
}

function isTargetBinaryExpression (esNode) {
  return esNode &&
        esNode.espath === 'arguments/0' &&
        esNode.node.type === 'BinaryExpression' &&
        esNode.isCaptured &&
        !(esNode.value);
}

module.exports = ComparisonReducer;
