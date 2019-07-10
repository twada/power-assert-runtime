/**
 * power-assert.js - Power Assert in JavaScript.
 *
 * https://github.com/power-assert-js/power-assert
 *
 * Copyright (c) 2013-2018 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/power-assert-js/power-assert/blob/master/MIT-LICENSE.txt
 */
'use strict';

const baseAssert = require('assert');
const _deepEqual = require('universal-deep-strict-equal');
const { rejects, doesNotReject } = require('rejected-or-not');
const empowerCore = require('empower-core');
const createFormatter = require('power-assert-context-formatter');
const AstReducer = require('power-assert-context-reducer-ast');
const FileRenderer = require('power-assert-renderer-file');
const AssertionRenderer = require('power-assert-renderer-assertion');
const DiagramRenderer = require('power-assert-renderer-diagram');
const ComparisonRenderer = require('power-assert-renderer-comparison');
const ComparisonReducer = require('power-assert-context-reducer-comparison');
const extractStack = require('extract-stack');
const shouldRecreateAssertionError = (function isStackUnchanged () {
  const ae = new baseAssert.AssertionError({
    actual: 123,
    expected: 456,
    operator: '==='
  });
  ae.message = '[REPLACED MESSAGE]';
  return !(/REPLACED MESSAGE/.test(ae.stack)) && /123 === 456/.test(ae.stack);
})();
const define = (obj, map) => {
  Object.keys(map).forEach((name) => {
    Object.defineProperty(obj, name, {
      configurable: true,
      enumerable: false,
      value: map[name],
      writable: true
    });
  });
};

if (typeof baseAssert.deepStrictEqual !== 'function') {
  baseAssert.deepStrictEqual = function deepStrictEqual (actual, expected, message) {
    if (!_deepEqual(actual, expected, true)) {
      baseAssert.fail(actual, expected, message, 'deepStrictEqual');
    }
  };
}
if (typeof baseAssert.notDeepStrictEqual !== 'function') {
  baseAssert.notDeepStrictEqual = function notDeepStrictEqual (actual, expected, message) {
    if (_deepEqual(actual, expected, true)) {
      baseAssert.fail(actual, expected, message, 'notDeepStrictEqual');
    }
  };
}
if (typeof baseAssert.rejects !== 'function') {
  baseAssert.rejects = rejects;
} else {
  // override assert.rejects on Node8 that only accepts functions, not Promises
  if (baseAssert.rejects.toString().startsWith('async function rejects(block,')) {
    baseAssert.rejects = rejects;
  }
}
if (typeof baseAssert.doesNotReject !== 'function') {
  baseAssert.doesNotReject = doesNotReject;
} else {
  // override assert.doesNotReject on Node8 that only accepts functions, not Promises
  if (baseAssert.doesNotReject.toString().startsWith('async function doesNotReject(block,')) {
    baseAssert.doesNotReject = doesNotReject;
  }
}

function customize (customOptions) {
  const options = customOptions || {};
  const applyEmpower = (fn) => {
    const format = createFormatter(
      Object.assign({
        pipeline: [
          AstReducer,
          FileRenderer,
          AssertionRenderer,
          { ctor: DiagramRenderer, options: Object.assign({ maxDepth: 2 }, options.output) },
          { ctor: ComparisonRenderer, options: Object.assign({ maxDepth: 2 }, options.output) },
          ComparisonReducer
        ]
      }, options.output)
    );
    return empowerCore(
      fn,
      Object.assign({
        onError: function onError (errorEvent) {
          let e = errorEvent.error;
          if (!/^AssertionError/.test(e.name)) {
            throw e;
          }
          if (!errorEvent.powerAssertContext) {
            throw e;
          }

          const context = errorEvent.powerAssertContext;
          const powerAssertText = format(context);
          const m = errorEvent.originalMessage;
          const poweredMessage = m ? m + ' ' + powerAssertText : powerAssertText;
          if (context.operator) {
            e.actual = context.actual;
            e.expected = context.expected;
            e.operator = context.operator;
          }
          if (shouldRecreateAssertionError) {
            e = new baseAssert.AssertionError({
              message: poweredMessage,
              actual: e.actual,
              expected: e.expected,
              operator: e.operator,
              stackStartFunction: e.stackStartFunction || onError
            });
          } else {
            e.message = poweredMessage;
          }
          e.powerAssertContext = errorEvent.powerAssertContext;
          e.generatedMessage = false;

          // delete power-assert runtime related stack lines
          const stackLines = extractStack.lines(e);
          const filteredLines = stackLines
            .filter((line) => !/empower/.test(line))
            .filter((line) => /\w+/.test(line));
          e.stack = filteredLines.map((line) => '    at ' + line).join('\n');

          throw e;
        }
      }, options.assertion)
    );
  };
  const poweredAssert = applyEmpower(baseAssert);
  poweredAssert.customize = customize;
  if (typeof baseAssert.strict === 'function') {
    poweredAssert.strict = applyEmpower(baseAssert.strict);
  } else {
    const strict = applyEmpower(baseAssert);
    poweredAssert.strict = Object.assign(strict, {
      equal: strict.strictEqual,
      deepEqual: strict.deepStrictEqual,
      notEqual: strict.notStrictEqual,
      notDeepEqual: strict.notDeepStrictEqual
    });
  }
  poweredAssert.strict.strict = poweredAssert.strict;
  return poweredAssert;
}

const defaultAssert = customize();
define(defaultAssert, { '__esModule': true });
defaultAssert['default'] = defaultAssert;
module.exports = defaultAssert;
