'use strict';

var slice = Array.prototype.slice;
var map = require('array-map');
var some = require('array-some');

function decorate (callSpec, decorator) {
    var func = callSpec.func;
    var thisObj = callSpec.thisObj;
    var numArgsToCapture = callSpec.numArgsToCapture;

    return function decoratedAssert () {
        var context, message, args = slice.apply(arguments);
        if (some(args, isCaptured)) {
            var values = map(args.slice(0, numArgsToCapture), function (arg) {
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

            if (numArgsToCapture === (args.length - 1)) {
                message = args[args.length - 1];
            }

            var invocation = {
                thisObj: thisObj,
                func: func,
                values: values,
                message: message
            };
            return decorator.concreteAssert(invocation, context);
        } else {
            return func.apply(thisObj, args);
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
