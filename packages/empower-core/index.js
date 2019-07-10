/**
 * empower-core - Power Assert feature enhancer for assert function/object.
 *
 * https://github.com/twada/power-assert-runtime/packages/empower-core
 *
 * Copyright (c) 2013-2018 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/twada/power-assert-runtime/blob/master/LICENSE
 */
const defaultOptions = require('./lib/default-options');
const Decorator = require('./lib/decorator');
const define = require('./lib/define-properties');
const slice = Array.prototype.slice;
const isEmpowered = (assertObjectOrFunction) => assertObjectOrFunction._empowered;

/**
 * Enhance Power Assert feature to assert function/object.
 * @param assert target assert function or object to enhance
 * @param options enhancement options
 * @return enhanced assert function/object
 */
function empowerCore (assert, options) {
  const typeOfAssert = (typeof assert);
  if ((typeOfAssert !== 'object' && typeOfAssert !== 'function') || assert === null) {
    throw new TypeError('empower-core argument should be a function or object.');
  }
  if (isEmpowered(assert)) {
    return assert;
  }
  let enhancedAssert;
  switch (typeOfAssert) {
    case 'function':
      enhancedAssert = empowerAssertFunction(assert, options);
      break;
    case 'object':
      enhancedAssert = empowerAssertObject(assert, options);
      break;
    default:
      throw new Error('Cannot be here');
  }
  define(enhancedAssert, { _empowered: true });
  return enhancedAssert;
}

function empowerAssertObject (assertObject, options) {
  const config = Object.assign(defaultOptions(), options);
  const target = config.destructive ? assertObject : Object.create(assertObject);
  const decorator = new Decorator(target, config);
  return Object.assign(target, decorator.enhancement());
}

function empowerAssertFunction (assertFunction, options) {
  const config = Object.assign(defaultOptions(), options);
  if (config.destructive) {
    throw new Error('cannot use destructive:true to function.');
  }
  const decorator = new Decorator(assertFunction, config);
  const enhancement = decorator.enhancement();
  let powerAssert;
  if (typeof enhancement === 'function') {
    powerAssert = function powerAssert () {
      return enhancement.apply(null, slice.apply(arguments));
    };
  } else {
    powerAssert = function powerAssert () {
      return assertFunction.apply(null, slice.apply(arguments));
    };
  }
  Object.assign(powerAssert, assertFunction);
  return Object.assign(powerAssert, enhancement);
}

empowerCore.defaultOptions = defaultOptions;
module.exports = empowerCore;
