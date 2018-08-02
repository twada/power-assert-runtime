'use strict';

var some = require('core-js/library/fn/array/some');
var map = require('core-js/library/fn/array/map');

function decorate (callSpec, decorator) {
    var numArgsToCapture = callSpec.numArgsToCapture;

    return function decoratedAssert () {
        var context, message, hasMessage = false;
        var assertionRecorder;

        // see: https://github.com/twada/empower-core/pull/8#issue-127859465
        // see: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
        var args = new Array(arguments.length);
        for(var i = 0; i < args.length; ++i) {
            args[i] = arguments[i];
        }

        // check and pop the last argument
        if (0 < args.length) {
            var lastOne = args[args.length - 1];
            if (typeof lastOne === 'object' &&
                lastOne !== null &&
                typeof lastOne.argRecs === 'function' &&
                typeof lastOne.metadata === 'function')
            {
                assertionRecorder = args.pop();
            }
        }

        // TODO consolidate
        if (numArgsToCapture === (args.length - 1)) {
            message = args.pop();
            hasMessage = true;
        }

        var invocation = {
            thisObj: this,
            values: args,
            message: message,
            hasMessage: hasMessage
        };

        if (assertionRecorder) {
            context = {
                source: assertionRecorder.metadata(),
                args: []
            };
            var recordedArgs = map(assertionRecorder.argRecs().slice(0, numArgsToCapture), function (argRec) { return argRec.eject(); });
            invocation.values = map(recordedArgs, function (arg, idx) {
                // TODO isNotCaptured??
                if (!arg) {
                    // TODO assert?
                    return arg;
                }
                context.args.push({
                    // config: arg.config,
                    value: arg.value,
                    events: arg.logs
                });
                return arg.value;
            });

            return decorator.concreteAssert(callSpec, invocation, context);
        } else if (some(args, isCaptured)) {
            invocation.values = map(args.slice(0, numArgsToCapture), function (arg, idx) {
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

            return decorator.concreteAssert(callSpec, invocation, context);
        } else {
            return decorator.concreteAssert(callSpec, invocation);
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
