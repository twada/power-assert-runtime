'use strict';

var locationOf = require('./location');
var literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;

function isLiteral (node) {
    return literalPattern.test(node.type);
}

function EsNode (path, currentNode, parentNode, espathToValue, jsCode, tokens) {
    if (path) {
        this.espath = path.join('/');
        this.parentEspath = path.slice(0, path.length - 1).join('/');
        this.currentProp = path[path.length - 1];
    } else {
        this.espath = '';
        this.parentEspath = '';
        this.currentProp = null;
    }
    this.currentNode = currentNode;
    this.parentNode = parentNode;
    this.parentEsNode = null;
    this.range = locationOf(this.currentNode, tokens);
    this.code = jsCode.slice(this.currentNode.range[0], this.currentNode.range[1]);
    this.isCaptured = espathToValue.hasOwnProperty(this.espath);
    this.value = isLiteral(this.currentNode) ? this.currentNode.value : espathToValue[this.espath];
}

module.exports = EsNode;
