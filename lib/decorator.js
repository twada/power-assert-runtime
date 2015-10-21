'use strict';

var escallmatch = require('escallmatch');
var extend = require('xtend/mutable');
var forEach = require('array-foreach');
var map = require('array-map');
var filter = require('array-filter');
var decorate = require('./decorate');


function Decorator (receiver, formatter, config) {
    this.receiver = receiver;
    this.formatter = formatter;
    this.config = config;
    this.matchers = map(config.patterns, escallmatch);
    this.eagerEvaluation = !(config.modifyMessageOnRethrow || config.saveContextOnRethrow);
}

Decorator.prototype.enhancement = function () {
    var that = this;
    var container = this.container();
    forEach(filter(this.matchers, methodCall), function (matcher) {
        var methodName = detectMethodName(matcher.calleeAst());
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
        var candidates = filter(this.matchers, functionCall);
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
    if (this.eagerEvaluation) {
        var poweredMessage = this.buildPowerAssertText(message, context);
        return func.apply(thisObj, args.concat(poweredMessage));
    }
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
        message: this.config.modifyMessageOnRethrow ? this.buildPowerAssertText(originalMessage, context) : e.message,
        stackStartFunction: Decorator.prototype.concreteAssert
    });
    if (this.config.saveContextOnRethrow) {
        f.powerAssertContext = context;
    }
    return f;
};

Decorator.prototype.buildPowerAssertText = function (message, context) {
    var powerAssertText = this.formatter(context);
    return message ? message + ' ' + powerAssertText : powerAssertText;
};


function numberOfArgumentsToCapture (matcher) {
    var argSpecs = matcher.argumentSignatures();
    var len = argSpecs.length;
    var lastArg;
    if (0 < len) {
        lastArg = argSpecs[len - 1];
        if (lastArg.name === 'message' && lastArg.kind === 'optional') {
            len -= 1;
        }
    }
    return len;
}


function detectMethodName (node) {
    if (node.type === 'MemberExpression') {
        return node.property.name;
    }
    return null;
}


function functionCall (matcher) {
    return matcher.calleeAst().type === 'Identifier';
}


function methodCall (matcher) {
    return matcher.calleeAst().type === 'MemberExpression';
}


module.exports = Decorator;
