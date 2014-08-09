'use strict';

var escallmatch = require('escallmatch'),
    extend = require('xtend/mutable'),
    capturable = require('./capturable'),
    decorate = require('./decorate'),
    slice = Array.prototype.slice,
    isPhantom = typeof window !== 'undefined' && typeof window.callPhantom === 'function';


function Decorator (receiver, formatter, config) {
    this.receiver = receiver;
    this.formatter = formatter;
    this.config = config;
    this.matchers = config.patterns.map(function (pt) { return escallmatch(pt); });
    this.eagerEvaluation = !(config.modifyMessageOnFail || config.saveContextOnFail);
}

Decorator.prototype.decorated = function () {
    var that = this;
    var enhancement = {};
    if (typeof this.receiver === 'function') {
        var candidates = this.matchers.filter(function (matcher) { return matcher.calleeAst().type === 'Identifier'; });
        if (candidates.length === 1) {
            var functionMatcher = candidates[0];
            enhancement = decorate(numberOfArgumentsToCapture(functionMatcher), null, this.receiver, this);
        }
    }
    this.matchers.forEach(function (matcher) {
        var methodName = detectMethodName(matcher.calleeAst());
        if (methodName && typeof that.receiver[methodName] === 'function') {
            var numNonMessageArgs = numberOfArgumentsToCapture(matcher);
            var baseAssert = that.receiver[methodName];
            enhancement[methodName] = decorate(numNonMessageArgs, that.receiver, baseAssert, that);
        }
    });
    extend(enhancement, capturable());
    return enhancement;
};

Decorator.prototype.concreteAssert = function (baseAssert, args, message, context) {
    var f;
    if (this.eagerEvaluation) {
        args.push(this.buildPowerAssertText(message, context));
        return baseAssert.apply(this.receiver, args);
    }
    try {
        args.push(message);
        return baseAssert.apply(this.receiver, args);
    } catch (e) {
        if (e.name !== 'AssertionError') {
            throw e;
        }
        if (typeof this.receiver.AssertionError !== 'function') {
            throw e;
        }
        if (isPhantom) {
            f = new this.receiver.AssertionError({
                actual: e.actual,
                expected: e.expected,
                operator: e.operator,
                message: e.message
            });
        } else {
            f = e;
        }
        if (this.config.modifyMessageOnFail) {
            f.message = this.buildPowerAssertText(message, context);
            if (typeof e.generatedMessage !== 'undefined') {
                f.generatedMessage = false;
            }
        }
        if (this.config.saveContextOnFail) {
            f.powerAssertContext = context;
        }
        throw f;
    }
};

Decorator.prototype.buildPowerAssertText = function (message, context) {
    var powerAssertText = this.formatter(context);
    return message ? message + ' ' + powerAssertText : powerAssertText;
};


function numberOfArgumentsToCapture (matcher) {
    var argSpecs = matcher.argumentSignatures(),
        len = argSpecs.length,
        lastArg;
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


module.exports = Decorator;
