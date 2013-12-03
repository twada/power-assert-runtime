/**
 * empower.js - Power Assert feature enhancer for assert function/object.
 *
 * https://github.com/twada/empower
 *
 * Copyright (c) 2013 Takuto Wada
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
        define(['./power-assert-formatter'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('./power-assert-formatter'));
    } else {
        root.empower = factory(root.powerAssertFormatter);
    }
}(this, function (defaultFormatter) {
    'use strict';


    function defaultOptions () {
        return {
            destructive: false,
            formatter: defaultFormatter,
            lineSeparator: '\n',
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
     * @param options enhancement options
     * @return enhanced assert function/object
     */
    function empower (assert, options) {
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
            return empowerAssertFunction(assert, config);
        case 'object':
            return empowerAssertObject(assert, config);
        default:
            throw new Error('Cannot be here');
        }
    }


    function isEmpowered (assertObjectOrFunction) {
        return (typeof assertObjectOrFunction._capt === 'function') && (typeof assertObjectOrFunction._expr === 'function');
    }


    function empowerAssertObject (assertObject, config) {
        if (typeof assertObject.ok !== 'function') {
            throw new TypeError('empower target object should be respond to \'ok\' method.');
        }
        var enhancement = enhance(assertObject, config),
            target = config.destructive ? assertObject : Object.create(assertObject);
        return extend(target, enhancement);
    }


    function empowerAssertFunction (assertFunction, config) {
        if (config.destructive) {
            throw new Error('cannot use destructive:true to function.');
        }
        var enhancement = enhance(assertFunction, config),
            powerAssert = function powerAssert (context, message) {
                enhancement.ok(context, message);
            };
        extend(powerAssert, assertFunction);
        return extend(powerAssert, enhancement);
    }


    function enhance (target, config) {
        var events = [],
            proxy = {};

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
                proxy[methodName] = createMethodProxyForOneArg(bind(target[methodName], target), config);
            }
        });
        config.targetMethods.twoArgs.forEach(function (methodName) {
            if (typeof target[methodName] === 'function') {
                proxy[methodName] = createMethodProxyForTwoArgs(bind(target[methodName], target), config);
            }
        });

        proxy._capt = _capt;
        proxy._expr = _expr;
        return proxy;
    }


    function isEspoweredValue (value) {
        return (typeof value !== 'undefined') && (typeof value.powerAssertContext !== 'undefined');
    }


    function createMethodProxyForOneArg (baseAssert, config) {
        return function (value, message) {
            var context, powerAssertText;
            if (! isEspoweredValue(value)) {
                return baseAssert(value, message);
            }
            context = value.powerAssertContext;
            powerAssertText = config.formatter.format(context).join(config.lineSeparator);
            return baseAssert(context.value, message ? message + ' ' + powerAssertText : powerAssertText);
        };
    }


    function createMethodProxyForTwoArgs (baseAssert, config) {
        return function (arg1, arg2, message) {
            var context, val1, val2, powerAssertText;
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

            powerAssertText = config.formatter.format(context).join(config.lineSeparator);
            return baseAssert(val1, val2, message ? message + ' ' + powerAssertText : powerAssertText);
        };
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


    // borrowed from https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    function bind (aFunction, oThis) {
        if (typeof aFunction !== 'function') {
            throw new TypeError('bind - what is trying to be bound is not callable');
        }
        var aArgs = Array.prototype.slice.call(arguments, 2),
            fToBind = aFunction,
            NOP = function () {},
            fBound = function () {
                return fToBind.apply(((aFunction instanceof NOP) && oThis) ? aFunction : oThis,
                                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };
        NOP.prototype = aFunction.prototype;
        fBound.prototype = new NOP();
        return fBound;
    }


    // using returnExports UMD pattern with substack pattern
    empower.defaultOptions = defaultOptions;
    return empower;
}));
