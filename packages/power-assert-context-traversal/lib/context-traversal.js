'use strict';

const EventEmitter = require('events').EventEmitter;
const estraverse = require('estraverse');
const locationOf = require('./location');
const literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;
const isLiteral = (node) => literalPattern.test(node.type);

class ContextTraversal extends EventEmitter {
  constructor (powerAssertContext) {
    super();
    this.powerAssertContext = powerAssertContext;
  }
  traverse () {
    const _this = this;
    const source = this.powerAssertContext.source;
    this.emit('start', this.powerAssertContext);
    this.powerAssertContext.args.forEach((capturedArgument) => {
      const matchIndex = capturedArgument.matchIndex;
      capturedArgument.paramDef = source.params.find((p) => p.index === matchIndex);
      _this.emit('arg:enter', capturedArgument);
      onEachEsNode(capturedArgument, source, function (esNode) {
        _this.emit('data', esNode);
      });
      // _this.emit('arg:leave');
    });
    this.emit('end');
  }
}

function onEachEsNode (capturedArgument, source, callback) {
  const espathToValue = capturedArgument.events.reduce((accum, ev) => {
    accum[ev.espath] = ev.value;
    return accum;
  }, {});
  const nodeStack = [];
  const paramDef = capturedArgument.paramDef;
  // const matchIndex = capturedArgument.matchIndex;
  // const paramDef = source.params.find((p) => p.index === matchIndex);
  estraverse.traverse(source.ast, {
    keys: source.visitorKeys,
    enter: function (currentNode, parentNode) {
      const parentEsNode = (nodeStack.length > 0) ? nodeStack[nodeStack.length - 1] : null;
      const esNode = createEsNode(this.path(), currentNode, espathToValue, source.content, source.tokens, parentEsNode, paramDef);
      nodeStack.push(esNode);
      callback(esNode);
    },
    leave: function (currentNode, parentNode) {
      nodeStack.pop();
    }
  });
}

function createEsNode (path, currentNode, espathToValue, jsCode, tokens, parent, paramDef) {
  const espath = path ? path.join('/') : '';
  return {
    espath: espath,
    parent: parent,
    key: path ? path[path.length - 1] : null,
    node: currentNode,
    code: jsCode.slice(currentNode.range[0], currentNode.range[1]),
    value: isLiteral(currentNode) ? currentNode.value : espathToValue[espath],
    isCaptured: espathToValue.hasOwnProperty(espath),
    range: locationOf(currentNode, tokens),
    paramDef
  };
}

module.exports = ContextTraversal;
