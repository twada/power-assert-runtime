'use strict';

var escallmatch = require('escallmatch'),
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
    // check function signature
    var enhancement = (typeof this.receiver === 'function') ? decorate(1, null, this.receiver, this) : {};
    var that = this;
    this.matchers.forEach(function (matcher) {
        var methodName = detectMethodName(matcher.calleeAst());
        if (methodName && typeof that.receiver[methodName] === 'function') {
            var numNonMessageArgs = numberOfArgumentsToCapture(matcher);
            var baseAssert = that.receiver[methodName];
            enhancement[methodName] = decorate(numNonMessageArgs, that.receiver, baseAssert, that);
        }
    });
    makeCapturable(enhancement);
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


function decorate (numNonMessageArgs, receiver, baseAssert, decorator) {
    return function () {
        var context, message, args = slice.apply(arguments);

        if (args.every(function (arg) { return !isEspoweredValue(arg); })) {
            return baseAssert.apply(receiver, args);
        }

        var values = args.slice(0, numNonMessageArgs).map(function (arg, idx) {
            if (!isEspoweredValue(arg)) {
                return arg;
            }
            if (!context) {
                context = {
                    source: arg.source,
                    args: []
                };
            }
            context.args.push({
                value: arg.powerAssertContext.value,
                events: arg.powerAssertContext.events
            });
            return arg.powerAssertContext.value;
        });

        if (numNonMessageArgs === (args.length - 1)) {
            message = args[args.length - 1];
        }

        return decorator.concreteAssert(baseAssert, values, message, context);
    };
}


function makeCapturable(enhancement) {
    var events = [];

    function _capt (value, espath) {
        events.push({value: value, espath: espath});
        return value;
    }

    function _expr (value, args) {
        var captured = events;
        events = [];
        return { powerAssertContext: {value: value, events: captured}, source: {content: args.content, filepath: args.filepath, line: args.line} };
    }

    enhancement._capt = _capt;
    enhancement._expr = _expr;
}


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


function isEspoweredValue (value) {
    return (typeof value === 'object') && (value !== null) && (typeof value.powerAssertContext !== 'undefined');
}


module.exports = Decorator;
