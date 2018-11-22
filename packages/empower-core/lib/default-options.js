'use strict';

module.exports = function defaultOptions () {
    return {
        destructive: false,
        bindReceiver: true,
        onError: onError,
        onSuccess: onSuccess,
        onFulfilled: onFulfilled,
        onRejected: onRejected,
        patterns: [
            'assert(value, [message])',
            'assert.ok(value, [message])',
            'assert.equal(actual, expected, [message])',
            'assert.notEqual(actual, expected, [message])',
            'assert.strictEqual(actual, expected, [message])',
            'assert.notStrictEqual(actual, expected, [message])',
            'assert.deepEqual(actual, expected, [message])',
            'assert.notDeepEqual(actual, expected, [message])',
            'assert.deepStrictEqual(actual, expected, [message])',
            'assert.notDeepStrictEqual(actual, expected, [message])',
            'assert.throws(block, [error], [message])',
            'assert.doesNotThrow(block, [error], [message])',
            'assert.rejects(block, [error], [message])',
            'assert.doesNotReject(block, [error], [message])'
        ],
        wrapOnlyPatterns: []
    };
};

function onError (errorEvent) {
    const e = errorEvent.error;
    if (errorEvent.powerAssertContext && /^AssertionError/.test(e.name)) {
        e.powerAssertContext = errorEvent.powerAssertContext;
    }
    throw e;
}

function onSuccess(successEvent) {
    return successEvent.returnValue;
}

function onRejected (errorEvent, resolve, reject) {
    const originalError = errorEvent.error;
    const config = errorEvent.config;
    try {
        const handlerResult = config.onError.call(this, errorEvent);
        if (typeof handlerResult !== 'undefined') {
            reject(handlerResult);
            return;
        }
    } catch (rethrown) {
        reject(rethrown);
        return;
    }
    reject(originalError);
}

function onFulfilled(successEvent, resolve, reject) {
    const config = successEvent.config;
    const handlerResult = config.onSuccess.call(this, successEvent);
    resolve(handlerResult);
}
