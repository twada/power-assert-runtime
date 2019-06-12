'use strict';

const signature = require('call-signature');
const decorate = require('./decorate');
const define = require('./define-properties');
const functionCall = (matcherSpec) => matcherSpec.parsed.callee.type === 'Identifier';
const methodCall = (matcherSpec) => matcherSpec.parsed.callee.type === 'MemberExpression';
const detectMethodName = (callee) => (callee.type === 'MemberExpression') ? callee.member : null;
const isPromiseLike = (obj) => obj !== null &&
          typeof obj === 'object' &&
          typeof obj.then === 'function' &&
          typeof obj.catch === 'function';

class Decorator {
  constructor (receiver, config) {
    this.receiver = receiver;
    this.config = config;
    this.onError = config.onError;
    this.onSuccess = config.onSuccess;
    this.onRejected = config.onRejected;
    this.onFulfilled = config.onFulfilled;
    this.signatures = config.patterns.map(parse);
    this.wrapOnlySignatures = config.wrapOnlyPatterns.map(parse);
  }
  enhancement () {
    const container = this.container();
    const wrappedMethods = [];
    const attach = (matcherSpec, enhanced) => {
      const matcher = matcherSpec.parsed;
      const methodName = detectMethodName(matcher.callee);
      if (typeof this.receiver[methodName] !== 'function' || wrappedMethods.indexOf(methodName) !== -1) {
        return;
      }
      const callSpec = {
        thisObj: this.receiver,
        func: this.receiver[methodName],
        numArgsToCapture: numberOfArgumentsToCapture(matcherSpec),
        matcherSpec: matcherSpec,
        enhanced: enhanced
      };
      container[methodName] = callSpec.enhancedFunc = decorate(callSpec, this);
      define(callSpec.enhancedFunc, { _empowered: true });
      wrappedMethods.push(methodName);
    };
    this.signatures.filter(methodCall).forEach((matcher) => {
      attach(matcher, true);
    });
    this.wrapOnlySignatures.filter(methodCall).forEach((matcher) => {
      attach(matcher, false);
    });
    return container;
  }
  container () {
    let basement = {};
    if (typeof this.receiver === 'function') {
      let candidates = this.signatures.filter(functionCall);
      let enhanced = true;
      if (candidates.length === 0) {
        enhanced = false;
        candidates = this.wrapOnlySignatures.filter(functionCall);
      }
      if (candidates.length === 1) {
        const callSpec = {
          thisObj: null,
          func: this.receiver,
          numArgsToCapture: numberOfArgumentsToCapture(candidates[0]),
          matcherSpec: candidates[0],
          enhanced: enhanced
        };
        basement = callSpec.enhancedFunc = decorate(callSpec, this);
      }
    }
    return basement;
  }
  concreteAssert (callSpec, invocation, context) {
    const func = callSpec.func;
    const thisObj = this.config.bindReceiver ? callSpec.thisObj : invocation.thisObj;
    const enhanced = callSpec.enhanced;
    const args = invocation.values;
    const matcherSpec = callSpec.matcherSpec;
    let message;
    if (invocation.hasMessage) {
      message = args[args.length - 1];
    }
    // TODO: deprecate
    if (context && typeof this.config.modifyMessageBeforeAssert === 'function') {
      message = this.config.modifyMessageBeforeAssert({ originalMessage: message, powerAssertContext: context });
      if (invocation.hasMessage) {
        args[args.length - 1] = message;
      } else {
        args.push(message);
      }
    }

    const data = {
      thisObj: invocation.thisObj,
      assertionFunction: callSpec.enhancedFunc,
      originalMessage: message,
      defaultMessage: matcherSpec.defaultMessage,
      matcherSpec: matcherSpec,
      enhanced: enhanced,
      config: this.config,
      args: args
    };

    if (context) {
      data.powerAssertContext = context; // API (used in AVA)
    }

    return this._callFunc(func, thisObj, args, data);
  }
  // see: https://github.com/twada/empower-core/pull/8#issuecomment-173480982
  _callFunc (func, thisObj, args, data) {
    let ret;
    try {
      ret = func.apply(thisObj, args);
      if (isPromiseLike(ret)) {
        return new Promise((resolve, reject) => {
          ret.then((t) => { // onFulfilled
            data.assertionThrew = false;
            data.returnValue = t;
            try {
              this.onFulfilled.call(thisObj, data, resolve, reject);
            } catch (avoidUnhandled) {
              reject(avoidUnhandled);
            }
          }, (e) => { // onRejected
            data.assertionThrew = true;
            data.error = e; // API (used in AVA)
            try {
              this.onRejected.call(thisObj, data, resolve, reject);
            } catch (avoidUnhandled) {
              reject(avoidUnhandled);
            }
          });
        });
      }
    } catch (e) {
      data.assertionThrew = true;
      data.error = e; // API (used in AVA)
      return this.onError.call(thisObj, data);
    }
    data.assertionThrew = false;
    data.returnValue = ret;
    return this.onSuccess.call(thisObj, data);
  }
}

function numberOfArgumentsToCapture (matcherSpec) {
  const matcher = matcherSpec.parsed;
  let len = matcher.args.length;
  let lastArg;
  if (len > 0) {
    lastArg = matcher.args[len - 1];
    if (lastArg.name === 'message' && lastArg.optional) {
      len -= 1;
    }
  }
  return len;
}

function parse (matcherSpec) {
  if (typeof matcherSpec === 'string') {
    matcherSpec = { pattern: matcherSpec };
  }
  const ret = {};
  Object.keys(matcherSpec).forEach((key) => {
    ret[key] = matcherSpec[key];
  });
  ret.parsed = signature.parse(matcherSpec.pattern);
  return ret;
}

module.exports = Decorator;
