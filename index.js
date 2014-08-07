/**
 * empower - Power Assert feature enhancer for assert function/object.
 *
 * https://github.com/twada/empower
 *
 * Copyright (c) 2013-2014 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/twada/empower/blob/master/MIT-LICENSE.txt
 */
var defaultOptions = require('./lib/default-options'),
    enhancer = require('./lib/enhancer'),
    extend = require('node.extend');

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
        return enhancer.empowerAssertFunction(assert, formatter, config);
    case 'object':
        return enhancer.empowerAssertObject(assert, formatter, config);
    default:
        throw new Error('Cannot be here');
    }
}

function isEmpowered (assertObjectOrFunction) {
    return (typeof assertObjectOrFunction._capt === 'function') && (typeof assertObjectOrFunction._expr === 'function');
}

empower.defaultOptions = defaultOptions;
module.exports = empower;
