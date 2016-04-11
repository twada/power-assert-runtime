'use strict';

var locationOf = require('./location');
var literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;

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

module.exports = createEsNode;
