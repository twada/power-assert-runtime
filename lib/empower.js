/**
 * empower.js - Power Assert feature enhancer for assert function/object.
 *
 * https://github.com/twada/empower
 *
 * Copyright (c) 2013-2014 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/twada/empower/blob/master/MIT-LICENSE.txt
 */
'use strict';

var extend = require('node.extend'),
    escallmatch = require('escallmatch'),
    isPhantom = typeof window !== 'undefined' && typeof window.callPhantom === 'function';

function defaultOptions () {
    return {
        destructive: false,
        modifyMessageOnFail: false,
        saveContextOnFail: false,
        targetMethods: {
            oneArg: [
                'ok'
            ],
            twoArgs: [
                'equal',
                'notEqual',
                'strictEqual',
                'notStrictEqual',
                'deepEqual',
                'notDeepEqual'
            ]
        },
        patterns: [
            'assert(value, [message])',
            'assert.ok(value, [message])',
            'assert.equal(actual, expected, [message])',
            'assert.notEqual(actual, expected, [message])',
            'assert.strictEqual(actual, expected, [message])',
            'assert.notStrictEqual(actual, expected, [message])',
            'assert.deepEqual(actual, expected, [message])',
            'assert.notDeepEqual(actual, expected, [message])'
        ]
    };
}


/**
 * Enhance Power Assert feature to assert function/object.
 * @param assert target assert function or object to enhance
 * @param formatter power assert format function
 * @param options enhancement options
 * @return enhanced assert function/object
 */
function empower (assert, formatter, options) {
    var typeOfAssert = (typeof assert),
        config;
    if ((typeOfAssert !== 'object' && typeOfAssert !== 'function') || assert === null) {
        throw new TypeError('empower argument should be a function or object.');
    }
    if (isEmpowered(assert)) {
        return assert;
    }
    config = extend(defaultOptions(), (options || {}));
    switch (typeOfAssert) {
    case 'function':
        return empowerAssertFunction(assert, formatter, config);
    case 'object':
        return empowerAssertObject(assert, formatter, config);
    default:
        throw new Error('Cannot be here');
    }
}


function isEmpowered (assertObjectOrFunction) {
    return (typeof assertObjectOrFunction._capt === 'function') && (typeof assertObjectOrFunction._expr === 'function');
}


function empowerAssertObject (assertObject, formatter, config) {
    var enhancement = enhance(assertObject, formatter, config),
        target = config.destructive ? assertObject : Object.create(assertObject);
    return extend(target, enhancement);
}


function empowerAssertFunction (assertFunction, formatter, config) {
    if (config.destructive) {
        throw new Error('cannot use destructive:true to function.');
    }
    var enhancement = enhance(assertFunction, formatter, config),
        powerAssert = function powerAssert (context, message) {
            enhancement(context, message);
        };
    extend(powerAssert, assertFunction);
    return extend(powerAssert, enhancement);
}


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
        enhancement = (typeof target === 'function') ? decorateOneArg(target, target, doPowerAssert) : {},
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
            switch (len) {
            case 1:
                enhancement[methodName] = decorateOneArg(target, target[methodName], doPowerAssert);
                break;
            case 2:
                enhancement[methodName] = decorateTwoArgs(target, target[methodName], doPowerAssert);
                break;
            default:
                throw new Error('not supported');
            }
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


function decorateOneArg (target, baseAssert, doPowerAssert) {
    return function (arg1, message) {
        var context, val1;
        if (! isEspoweredValue(arg1)) {
            return baseAssert.apply(target, [arg1, message]);
        }
        val1 = arg1.powerAssertContext.value;
        context = {
            source: arg1.source,
            args: []
        };
        context.args.push({
            value: val1,
            events: arg1.powerAssertContext.events
        });
        return doPowerAssert(baseAssert, [val1], message, context);
    };
}


function decorateTwoArgs (target, baseAssert, doPowerAssert) {
    return function (arg1, arg2, message) {
        var context, val1, val2;
        if (!(isEspoweredValue(arg1) || isEspoweredValue(arg2))) {
            return baseAssert.apply(target, [arg1, arg2, message]);
        }

        if (isEspoweredValue(arg1)) {
            context = {
                source: arg1.source,
                args: []
            };
            context.args.push({
                value: arg1.powerAssertContext.value,
                events: arg1.powerAssertContext.events
            });
            val1 = arg1.powerAssertContext.value;
        } else {
            val1 = arg1;
        }

        if (isEspoweredValue(arg2)) {
            if (!isEspoweredValue(arg1)) {
                context = {
                    source: arg2.source,
                    args: []
                };
            }
            context.args.push({
                value: arg2.powerAssertContext.value,
                events: arg2.powerAssertContext.events
            });
            val2 = arg2.powerAssertContext.value;
        } else {
            val2 = arg2;
        }

        return doPowerAssert(baseAssert, [val1, val2], message, context);
    };
}


empower.defaultOptions = defaultOptions;
module.exports = empower;
