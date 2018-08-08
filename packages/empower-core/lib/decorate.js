'use strict';

var forEach = require('core-js/library/fn/array/for-each');
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

        // check the last argument
        if (0 < args.length) {
            var lastOne = args[args.length - 1];
            if (isAssertionRecorder(lastOne)) {
                assertionRecorder = lastOne;
            }
        }

        if (!assertionRecorder && numArgsToCapture === (args.length - 1)) {
            message = args.pop();
            hasMessage = true;
        }

        var invocation = {
            thisObj: this,
            values: args,
            message: message,
            hasMessage: hasMessage
        };

        // Each argument is an ArgumentRecorder or an AssertionRecorder or a Literal
        if (assertionRecorder) {
            context = {
                source: assertionRecorder.metadata(),
                args: []
            };
            invocation.values = map(args, function (arg) {
                if (isAssertionRecorder(arg)) {
                    arg = arg.message(); // that is ArgumentRecorder or literal
                }
                if (!isRecorded(arg)) {
                    return arg;
                }
                var record = arg.eject();
                context.args.push({
                    // config: arg.config,  // per argument configuration
                    value: record.value,
                    events: record.logs
                });
                return record.value;
            });
            // TODO: restore original message from argumentRecorder
            // invocation.message = assertionRecorder.message();
            return decorator.concreteAssert(callSpec, invocation, context);
        } else if (some(args, isRecorded)) {
            invocation.values = map(args, function (arg) {
                if (!isRecorded(arg)) {
                    return arg;
                }
                if (!context) {
                    context = {
                        source: arg.metadata(),
                        args: []
                    };
                }
                var record = arg.eject();
                context.args.push({
                    // config: arg.config,  // per argument configuration
                    value: record.value,
                    events: record.logs
                });
                return record.value;
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

function eject (argRec) {
    return argRec.eject();
}

function isNotCaptured (value) {
    return !isCaptured(value);
}

function isCaptured (value) {
    return (typeof value === 'object') &&
        (value !== null) &&
        (typeof value.powerAssertContext !== 'undefined');
}

function isRecorded (value) {
    return typeof value === 'object' &&
        value !== null &&
        typeof value.value === 'function' &&
        typeof value.eject === 'function';
}

function isAssertionRecorder (o) {
    return typeof o === 'object' &&
        o !== null &&
        typeof o.argRecs === 'function' &&
        typeof o.metadata === 'function';
}

module.exports = decorate;
