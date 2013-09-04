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


    var DEFAULT_OPTIONS = {
        destructive: false,
        formatter: defaultFormatter
    };


    /**
     * Enhance Power Assert feature to assert function/object.
     * @param assert target assert function or object to enhance
     * @param options enhancement options
     * @return enhanced assert function/object
     */
    function empower (assert, options) {
        var config;
        if (isEmpowered(assert)) {
            return assert;
        }
        config = extend(extend({}, DEFAULT_OPTIONS), (options || {}));
        switch (typeof assert) {
        case 'function':
            return empowerAssertFunction(assert, config);
        case 'object':
            return empowerAssertObject(assert, config);
        default:
            throw new Error('Cannot be here');
        }
    }


    function empowerAssertObject (assertObject, config) {
        var baseAssert = config.destructive ? assertObject.ok : bind(assertObject.ok, assertObject),
            enhancement = enhance(baseAssert, config),
            target = config.destructive ? assertObject : Object.create(assertObject);
        return extend(target, enhancement);
    }


    function empowerAssertFunction (assertFunction, config) {
        var enhancement = enhance(assertFunction, config),
            powerAssert = function powerAssert (context, message) {
                enhancement.ok(context, message);
            };
        extend(powerAssert, assertFunction);
        return extend(powerAssert, enhancement);
    }


    function isEmpowered (assertObjectOrFunction) {
        return (typeof assertObjectOrFunction._capt === 'function') && (typeof assertObjectOrFunction._expr === 'function');
    }


    function enhance (baseAssert, config) {
        var events = [];

        function PowerAssertContext (arg) {
            this.context = arg;
        }

        function _capt (value, kind, location) {
            events.push({value: value, kind: kind, location: location});
            return value;
        }

        function _expr (result, location, content) {
            var captured = events;
            events = [];
            return new PowerAssertContext({result: result, location: location, content: content, events: captured});
        }

        function empoweredAssert (value, message) {
            if (value instanceof PowerAssertContext) {
                var context = value.context,
                    callback,
                    powerAssertText;
                if (!context.result) {
                    if (typeof config.callback === 'function') {
                        callback = config.callback;
                        callback(context, message);
                    } else {
                        powerAssertText = config.formatter.format(context).join('\n');
                        baseAssert(context.result, message ? message + ' ' + powerAssertText : powerAssertText);
                    }
                } else {
                    baseAssert(context.result, message);
                }
            } else {
                baseAssert(value, message);
            }
        }

        return {
            ok: empoweredAssert,
            _capt: _capt,
            _expr: _expr
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
    empower.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
    return empower;
}));
