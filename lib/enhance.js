'use strict';

var escallmatch = require('escallmatch'),
    slice = Array.prototype.slice,
    isPhantom = typeof window !== 'undefined' && typeof window.callPhantom === 'function';


function enhance (target, formatter, config) {
    var eagerEvaluation = !(config.modifyMessageOnFail || config.saveContextOnFail),
        doPowerAssert = function (baseAssert, args, message, context) {
            var f;
            if (eagerEvaluation) {
                args.push(buildPowerAssertText(message, context));
                return baseAssert.apply(target, args);
            }
            try {
                args.push(message);
                return baseAssert.apply(target, args);
            } catch (e) {
                if (e.name !== 'AssertionError') {
                    throw e;
                }
                if (typeof target.AssertionError !== 'function') {
                    throw e;
                }
                if (isPhantom) {
                    f = new target.AssertionError({
                        actual: e.actual,
                        expected: e.expected,
                        operator: e.operator,
                        message: e.message
                    });
                } else {
                    f = e;
                }
                if (config.modifyMessageOnFail) {
                    f.message = buildPowerAssertText(message, context);
                    if (typeof e.generatedMessage !== 'undefined') {
                        f.generatedMessage = false;
                    }
                }
                if (config.saveContextOnFail) {
                    f.powerAssertContext = context;
                }
                throw f;
            }
        },
        // check function signiture
        enhancement = (typeof target === 'function') ? decorateArgs(1, target, target, doPowerAssert) : {},
        events = [];

    function buildPowerAssertText (message, context) {
        var powerAssertText = formatter(context);
        return message ? message + ' ' + powerAssertText : powerAssertText;
    }

    function _capt (value, espath) {
        events.push({value: value, espath: espath});
        return value;
    }

    function _expr (value, args) {
        var captured = events;
        events = [];
        return { powerAssertContext: {value: value, events: captured}, source: {content: args.content, filepath: args.filepath, line: args.line} };
    }

    var matchers = config.patterns.map(function (pt) { return escallmatch(pt); });
    matchers.forEach(function (matcher) {
        var args = matcher.argumentSignitures();
        var len = args.length,
            lastArg;
        if (0 < len) {
            lastArg = args[len - 1];
            if (lastArg.name === 'message' && lastArg.kind === 'optional') {
                len -= 1;
            }
        }
        var methodName = detectMethodName(matcher.calleeAst());
        if (methodName && typeof target[methodName] === 'function') {
            enhancement[methodName] = decorateArgs(len, target, target[methodName], doPowerAssert);
        }
    });

    enhancement._capt = _capt;
    enhancement._expr = _expr;
    return enhancement;
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


function decorateArgs (numNonMessageArgs, target, baseAssert, doPowerAssert) {
    return function () {
        var context, message, args = slice.apply(arguments);

        if (args.every(function (arg) { return !isEspoweredValue(arg); })) {
            return baseAssert.apply(target, args);
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

        return doPowerAssert(baseAssert, values, message, context);
    };
}


module.exports = enhance;
