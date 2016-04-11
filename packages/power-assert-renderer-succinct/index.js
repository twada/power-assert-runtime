'use strict';

var DiagramRenderer = require('power-assert-renderer-diagram');
var inherits = require('util').inherits;
var some = require('array-some');

/**
 * options.stringify [function]
 * options.maxDepth [number]
 * options.indent [string]
 * options.lineSeparator [string]
 * options.anonymous [string]
 * options.circular [string]
 * options.snip [string]
 * options.handlers [object]
 * 
 * options.widthOf [function]
 * options.ambiguousEastAsianCharWidth [number]
 */
function SuccinctRenderer (config) {
    DiagramRenderer.call(this, config);
}
inherits(SuccinctRenderer, DiagramRenderer);

SuccinctRenderer.prototype.onData = function (esNode) {
    if (!esNode.isCaptured) {
        return;
    }
    if (withinMemberExpression(esNode)) {
        return;
    }
    this.dumpIfSupported(esNode);
};

SuccinctRenderer.prototype.dumpIfSupported = function (esNode) {
    switch(esNode.currentNode.type) {
    case 'Identifier':
    case 'MemberExpression':
    case 'CallExpression':
        this.events.push({value: esNode.value, leftIndex: esNode.range[0]});
        break;
    }
};

function withinMemberExpression (esNode) {
    var ancestors = collectAncestors([], esNode.getParent());
    return some(ancestors, function (eachNode) {
        return eachNode.currentNode.type === 'MemberExpression';
    });
}

function collectAncestors (ary, esNode) {
    if (!esNode) {
        return ary;
    }
    ary.push(esNode);
    return collectAncestors(ary, esNode.getParent());
}

module.exports = SuccinctRenderer;
