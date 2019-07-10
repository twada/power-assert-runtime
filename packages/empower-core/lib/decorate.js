'use strict';

const isNotCaptured = (value) => !isCaptured(value);
const isCaptured = (value) =>
  (typeof value === 'object') &&
          (value !== null) &&
          (typeof value.powerAssertContext !== 'undefined');
// MEMO: ArgumentRecorder or AssertionMessage
const isRecorded = (value) =>
  typeof value === 'object' &&
          value !== null &&
          typeof value.metadata === 'function' &&
          typeof value.matchIndex === 'function' &&
          typeof value.eject === 'function';

module.exports = function decorate (callSpec, decorator) {
  const numArgsToCapture = callSpec.numArgsToCapture;

  return function decoratedAssert () {
    const hasMessage = (numArgsToCapture === (arguments.length - 1));
    let context;

    // see: https://github.com/twada/empower-core/pull/8#issue-127859465
    // see: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
    const args = new Array(arguments.length);
    for (let i = 0; i < args.length; ++i) {
      args[i] = arguments[i];
    }

    const invocation = {
      thisObj: this, // be careful
      values: args,
      hasMessage: hasMessage
    };

    if (args.some(isRecorded)) {
      invocation.values = args.map((arg) => {
        if (!isRecorded(arg)) {
          return arg;
        }
        if (!context) {
          context = {
            source: arg.metadata(), // API (used in AVA)
            args: [] // API (used in AVA)
          };
        }
        const record = arg.eject();
        const matchIndex = arg.matchIndex();
        if (matchIndex === -1) { // generated AssertionMessage
          invocation.hasMessage = false;
        } else {
          context.args.push({
            matchIndex,
            value: record.value,
            events: record.logs // API (used in AVA)
          });
        }
        return record.value;
      });
      return decorator.concreteAssert(callSpec, invocation, context);
    } else if (args.some(isCaptured)) {
      invocation.values = args.map((arg, idx) => {
        if (isNotCaptured(arg)) {
          return arg;
        }
        if (!context) {
          context = {
            source: arg.source,
            args: []
          };
        }
        context.args.push({
          value: arg.powerAssertContext.value,
          events: arg.powerAssertContext.events
        });
        return arg.powerAssertContext.value;
      });
      return decorator.concreteAssert(callSpec, invocation, context);
    } else {
      return decorator.concreteAssert(callSpec, invocation);
    }
  };
};
