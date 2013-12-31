/**
 * empower.js - Power Assert feature enhancer for assert function/object.
 *
 * https://github.com/twada/empower
 *
 * Copyright (c) 2013-2014 Takuto Wada
 * Licensed under the MIT license.
 *   https://raw.github.com/twada/empower/master/MIT-LICENSE.txt
 *
 * A part of extend function is:
 *   Copyright 2012 jQuery Foundation and other contributors
 *   Released under the MIT license.
 *   http://jquery.org/license
 */
(function (root, factory) {
    'use strict';

    // using returnExports UMD pattern
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.empower = factory();
    }
}(this, function () {
    'use strict';


    function defaultOptions () {
        return {
            destructive: false,
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
            }
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
        if (typeof assertObject.ok !== 'function') {
            throw new TypeError('empower target object should be respond to \'ok\' method.');
        }
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
                enhancement.ok(context, message);
            };
        extend(powerAssert, assertFunction);
        return extend(powerAssert, enhancement);
    }


    function enhance (target, formatter, config) {
        var events = [],
            enhancement = {};

        function _capt (value, kind, location) {
            events.push({value: value, kind: kind, location: location});
            return value;
        }

        function _expr (value, location, content) {
            var captured = events;
            events = [];
            return { powerAssertContext: {value: value, location: location, content: content, events: captured} };
        }

        config.targetMethods.oneArg.forEach(function (methodName) {
            if (typeof target[methodName] === 'function') {
                enhancement[methodName] = decorateOneArg(target[methodName].bind(target), formatter);
            }
        });
        config.targetMethods.twoArgs.forEach(function (methodName) {
            if (typeof target[methodName] === 'function') {
                enhancement[methodName] = decorateTwoArgs(target[methodName].bind(target), formatter);
            }
        });

        enhancement._capt = _capt;
        enhancement._expr = _expr;
        return enhancement;
    }


    function isEspoweredValue (value) {
        return (typeof value !== 'undefined') && (typeof value.powerAssertContext !== 'undefined');
    }


    function decorateOneArg (baseAssert, formatter) {
        return function (value, message) {
            var context;
            if (! isEspoweredValue(value)) {
                return baseAssert(value, message);
            }
            context = value.powerAssertContext;
            return baseAssert(context.value, buildPowerAssertText(message, context, formatter));
        };
    }


    function decorateTwoArgs (baseAssert, formatter) {
        return function (arg1, arg2, message) {
            var context, val1, val2;
            if (!(isEspoweredValue(arg1) || isEspoweredValue(arg2))) {
                return baseAssert(arg1, arg2, message);
            }

            if (isEspoweredValue(arg1)) {
                context = extend({}, arg1.powerAssertContext);
                val1 = arg1.powerAssertContext.value;
            } else {
                val1 = arg1;
            }

            if (isEspoweredValue(arg2)) {
                if (isEspoweredValue(arg1)) {
                    context.events = context.events.concat(arg2.powerAssertContext.events);
                } else {
                    context = extend({}, arg2.powerAssertContext);
                }
                val2 = arg2.powerAssertContext.value;
            } else {
                val2 = arg2;
            }

            return baseAssert(val1, val2, buildPowerAssertText(message, context, formatter));
        };
    }


    function buildPowerAssertText (message, context, formatter) {
        var powerAssertText = formatter(context);
        return message ? message + ' ' + powerAssertText : powerAssertText;
    }


    // borrowed from qunit.js
    function extend (a, b) {
        var prop;
        for (prop in b) {
            if (b.hasOwnProperty(prop)) {
                if (typeof b[prop] === 'undefined') {
                    delete a[prop];
                } else {
                    a[prop] = b[prop];
                }
            }
        }
        return a;
    }


    // using returnExports UMD pattern with substack pattern
    empower.defaultOptions = defaultOptions;
    return empower;
}));
