'use strict';

var signature = require('call-signature');
var extend = require('xtend/mutable');
var forEach = require('array-foreach');
var map = require('array-map');
var filter = require('array-filter');
var decorate = require('./decorate');


function Decorator (receiver, config) {
    this.receiver = receiver;
    this.config = config;
    this.signatures = map(config.patterns, signature.parse);
    this.eagerEvaluation = !(config.modifyMessageOnRethrow || config.saveContextOnRethrow);
}

Decorator.prototype.enhancement = function () {
    var that = this;
    var container = this.container();
    forEach(filter(this.signatures, methodCall), function (matcher) {
        var methodName = detectMethodName(matcher.callee);
        if (typeof that.receiver[methodName] === 'function') {
            var callSpec = {
                thisObj: that.receiver,
                func: that.receiver[methodName],
                numArgsToCapture: numberOfArgumentsToCapture(matcher)
            };
            container[methodName] = decorate(callSpec, that);
        }
    });
    return container;
};

Decorator.prototype.container = function () {
    var basement = {};
    if (typeof this.receiver === 'function') {
        var candidates = filter(this.signatures, functionCall);
        if (candidates.length === 1) {
            var callSpec = {
                thisObj: null,
                func: this.receiver,
                numArgsToCapture: numberOfArgumentsToCapture(candidates[0])
            };
            basement = decorate(callSpec, this);
        }
    }
    return basement;
};

Decorator.prototype.concreteAssert = function (invocation, context) {
    var func = invocation.func;
    var thisObj = invocation.thisObj;
    var args = invocation.values;
    var message = invocation.message;
    try {
        return func.apply(thisObj, args.concat(message));
    } catch (e) {
        throw this.errorToRethrow(e, message, context);
    }
};

Decorator.prototype.errorToRethrow = function (e, originalMessage, context) {
    if (e.name !== 'AssertionError') {
        return e;
    }
    if (typeof this.receiver.AssertionError !== 'function') {
        return e;
    }
    var f = new this.receiver.AssertionError({
        actual: e.actual,
        expected: e.expected,
        operator: e.operator,
        message: e.message,
        stackStartFunction: Decorator.prototype.concreteAssert
    });
    if (this.config.saveContextOnRethrow) {
        f.powerAssertContext = context;
    }
    return f;
};


function numberOfArgumentsToCapture (matcher) {
    var len = matcher.args.length;
    var lastArg;
    if (0 < len) {
        lastArg = matcher.args[len - 1];
        if (lastArg.name === 'message' && lastArg.optional) {
            len -= 1;
        }
    }
    return len;
}


function detectMethodName (callee) {
    if (callee.type === 'MemberExpression') {
        return callee.member;
    }
    return null;
}


function functionCall (matcher) {
    return matcher.callee.type === 'Identifier';
}


function methodCall (matcher) {
    return matcher.callee.type === 'MemberExpression';
}


module.exports = Decorator;
