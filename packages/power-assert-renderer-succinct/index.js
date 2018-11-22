'use strict';

const DiagramRenderer = require('power-assert-renderer-diagram');

/**
 * options.stringify [function]
 * options.maxDepth [number]
 * options.lineSeparator [string]
 * options.anonymous [string]
 * options.circular [string]
 * 
 * options.widthOf [function]
 * options.ambiguousEastAsianCharWidth [number]
 */
class SuccinctRenderer extends DiagramRenderer {
    onData (esNode) {
        if (!esNode.isCaptured) {
            return;
        }
        if (withinMemberExpression(esNode)) {
            return;
        }
        this.dumpIfSupported(esNode);
    }
    dumpIfSupported (esNode) {
        switch(esNode.node.type) {
        case 'Identifier':
        case 'MemberExpression':
        case 'CallExpression':
            this.events.push({value: esNode.value, leftIndex: esNode.range[0]});
            break;
        }
    }
}

function withinMemberExpression (esNode) {
    const ancestors = collectAncestors([], esNode.parent);
    return ancestors.some((eachNode) => {
        return eachNode.node.type === 'MemberExpression';
    });
}

function collectAncestors (ary, esNode) {
    if (!esNode) {
        return ary;
    }
    ary.push(esNode);
    return collectAncestors(ary, esNode.parent);
}

module.exports = SuccinctRenderer;
