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
    this.espathToValue = espathToValue;
    this.jsCode = jsCode;
    this.tokens = tokens;
}

EsNode.prototype.setParent = function (parentEsNode) {
    this.parentEsNode = parentEsNode;
};

EsNode.prototype.getParent = function () {
    return this.parentEsNode;
};

EsNode.prototype.code = function () {
    return this.jsCode.slice(this.currentNode.range[0], this.currentNode.range[1]);
};

EsNode.prototype.value = function () {
    if (isLiteral(this.currentNode)) {
        return this.currentNode.value;
    }
    return this.espathToValue[this.espath];
};

EsNode.prototype.isCaptured = function () {
    return this.espathToValue.hasOwnProperty(this.espath);
};

EsNode.prototype.range = function () {
    return locationOf(this.currentNode, this.tokens);
};

module.exports = EsNode;
