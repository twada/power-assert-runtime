'use strict';

var extend = require('node.extend'),
    enhance = require('./enhance');

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

module.exports = {
    empowerAssertObject: empowerAssertObject,
    empowerAssertFunction: empowerAssertFunction
};
