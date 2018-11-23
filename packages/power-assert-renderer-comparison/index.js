'use strict';

const BaseRenderer = require('power-assert-renderer-base');
const typeName = require('type-name');
const udiff = require('./lib/udiff');
const stringifier = require('stringifier');
const defaultOptions = require('./lib/default-options');
const literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;
const isLiteral = (node) => literalPattern.test(node.type);
const isStringDiffTarget = (pair) => typeof pair.left.value === 'string' && typeof pair.right.value === 'string';

/**
 * options.stringify [function]
 * options.maxDepth [number]
 * options.lineSeparator [string]
 * options.anonymous [string]
 * options.circular [string]
 *
 * options.diff [function]
 * options.lineDiffThreshold [number]
 */
class ComparisonRenderer extends BaseRenderer {
  constructor (config) {
    super();
    this.config = Object.assign({}, defaultOptions(), config);
    if (typeof this.config.stringify === 'function') {
      this.stringify = this.config.stringify;
    } else {
      this.stringify = stringifier(this.config);
    }
    if (typeof this.config.diff === 'function') {
      this.diff = this.config.diff;
    } else {
      this.diff = udiff(this.config);
    }
    this.espathToPair = {};
  }
  onData (esNode) {
    if (isTargetBinaryExpression(esNode)) {
      this.espathToPair[esNode.espath] = {
        operator: esNode.node.operator,
        value: esNode.value
      };
    }
    if (isTargetBinaryExpression(esNode.parent)) {
      if (esNode.isCaptured || isLiteral(esNode.node)) {
        this.espathToPair[esNode.parent.espath][esNode.key] = { code: esNode.code, value: esNode.value };
      }
    }
  }
  onEnd () {
    const pairs = [];
    Object.keys(this.espathToPair).forEach((espath) => {
      const pair = this.espathToPair[espath];
      if (pair.left && pair.right) {
        pairs.push(pair);
      }
    });
    pairs.forEach((pair) => {
      this.compare(pair);
    });
  }
  compare (pair) {
    if (isStringDiffTarget(pair)) {
      this.showStringDiff(pair);
    } else {
      this.showExpectedAndActual(pair);
    }
  }
  showExpectedAndActual (pair) {
    this.write('');
    this.write(`[${typeName(pair.right.value)}] ${pair.right.code}`);
    this.write(`=> ${this.stringify(pair.right.value)}`);
    this.write(`[${typeName(pair.left.value)}] ${pair.left.code}`);
    this.write(`=> ${this.stringify(pair.left.value)}`);
  }
  showStringDiff (pair) {
    this.write('');
    this.write(`--- [string] ${pair.right.code}`);
    this.write(`+++ [string] ${pair.left.code}`);
    this.write(this.diff(pair.right.value, pair.left.value, this.config));
  }
}

function isTargetBinaryExpression (esNode) {
  return esNode &&
        esNode.node.type === 'BinaryExpression' &&
        (esNode.node.operator === '===' || esNode.node.operator === '==') &&
        esNode.isCaptured &&
        !(esNode.value);
}

ComparisonRenderer.udiff = udiff;
module.exports = ComparisonRenderer;
