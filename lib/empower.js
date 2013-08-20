/**
 * empower.js - Empower your assertions
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

    var defaultConfig = {
        destructive: false,
        formatter: defaultFormatter
    };


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


    function enhance (baseAssert, formatter, callback) {
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
                    powerAssertText;
                if (!context.result) {
                    if (typeof callback === 'function') {
                        callback(context, message);
                    } else {
                        powerAssertText = formatter.format(context).join('\n');
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


    function empowerAssertObject (assertObject, config) {
        var enhancement = enhance(assertObject.ok.bind(assertObject), config.formatter),
            target = config['destructive'] ? assertObject : Object.create(assertObject);
        return extend(target, enhancement);
    }


    function empowerAssertFunction (assertFunction, config) {
        var enhancement = enhance(assertFunction.ok.bind(assertFunction), config.formatter);
        var powerAssert = function powerAssert (context, message) {
            enhancement.ok(context, message);
        };
        extend(powerAssert, assertFunction);
        return extend(powerAssert, enhancement);
    }


    function empower (assert, options) {
        var config = extend({}, defaultConfig);
        extend(config, (options || {}));
        switch (typeof assert) {
        case 'function':
            return empowerAssertFunction(assert, config);
        case 'object':
            return empowerAssertObject(assert, config);
        default:
            throw new Error('Cannot be here');
        }
    }

    empower.enhance = enhance;

    return empower;
}));
