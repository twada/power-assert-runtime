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
    this._range = locationOf(this.currentNode, tokens);
    this._code = jsCode.slice(this.currentNode.range[0], this.currentNode.range[1]);
    this._isCaptured = espathToValue.hasOwnProperty(this.espath);
    this._value = isLiteral(this.currentNode) ? this.currentNode.value : espathToValue[this.espath];
}

EsNode.prototype.setParent = function (parentEsNode) {
    this.parentEsNode = parentEsNode;
};

EsNode.prototype.getParent = function () {
    return this.parentEsNode;
};

EsNode.prototype.code = function () {
    return this._code;
};

EsNode.prototype.value = function () {
    return this._value;
};

EsNode.prototype.isCaptured = function () {
    return this._isCaptured;
};

EsNode.prototype.range = function () {
    return this._range;
};

module.exports = EsNode;
