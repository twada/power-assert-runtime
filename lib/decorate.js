'use strict';

var slice = Array.prototype.slice;

function decorate (decorator, func, numNonMessageArgs, thisArg) {
    return function () {
        var context, message, args = slice.apply(arguments);

        if (args.every(function (arg) { return !isEspoweredValue(arg); })) {
            return func.apply(thisArg, args);
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

        return decorator.concreteAssert(func, values, message, context);
    };
}

function isEspoweredValue (value) {
    return (typeof value === 'object') && (value !== null) && (typeof value.powerAssertContext !== 'undefined');
}

module.exports = decorate;
