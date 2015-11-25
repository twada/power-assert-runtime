'use strict';

var slice = Array.prototype.slice;
var map = require('array-map');
var some = require('array-some');

function decorate (callSpec, decorator) {
    var func = callSpec.func;
    var thisObj = callSpec.thisObj;
    var numArgsToCapture = callSpec.numArgsToCapture;

    return function decoratedAssert () {
        var context, message, hasMessage = false, args = slice.apply(arguments);

        if (numArgsToCapture === (args.length - 1)) {
            message = args.pop();
            hasMessage = true;
        }

        var invocation = {
            thisObj: thisObj,
            func: func,
            values: args,
            message: message,
            hasMessage: hasMessage
        };

        if (some(args, isCaptured)) {
            invocation.values = map(args.slice(0, numArgsToCapture), function (arg) {
                if (isNotCaptured(arg)) {
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

            return decorator.concreteAssert(invocation, context);
        } else {
            return decorator.fallbackAssert(invocation);
        }
    };
}

function isNotCaptured (value) {
    return !isCaptured(value);
}

function isCaptured (value) {
    return (typeof value === 'object') &&
        (value !== null) &&
        (typeof value.powerAssertContext !== 'undefined');
}

module.exports = decorate;
