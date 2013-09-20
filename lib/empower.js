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
            lineSeparator: '\n'
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


    function empowerAssertObject (assertObject, config) {
        if (typeof assertObject.ok !== 'function') {
            throw new TypeError('empower target object should be respond to \'ok\' method.');
        }
        var baseAssert = config.destructive ? assertObject.ok : bind(assertObject.ok, assertObject),
            enhancement = enhance(baseAssert, config),
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
            var context, powerAssertText;
            if (value instanceof PowerAssertContext) {
                context = value.context;
                if (!context.result) {
                    powerAssertText = config.formatter.format(context).join(config.lineSeparator);
                    baseAssert(context.result, message ? message + ' ' + powerAssertText : powerAssertText);
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
    empower.defaultOptions = defaultOptions;
    return empower;
}));
