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
            'assert.rejects(block, [error], [message])',
            'assert.doesNotReject(block, [error], [message])'
        ],
        wrapOnlyPatterns: []
    };
};

function onError (errorEvent) {
    var e = errorEvent.error;
    if (errorEvent.powerAssertContext && /^AssertionError/.test(e.name)) {
        e.powerAssertContext = errorEvent.powerAssertContext;
    }
    throw e;
}

function onSuccess(successEvent) {
    return successEvent.returnValue;
}

function onRejected (errorEvent, resolve, reject) {
    var originalError = errorEvent.error;
    var config = errorEvent.config;
    try {
        var handlerResult = config.onError.call(this, errorEvent);
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
    var config = successEvent.config;
    var handlerResult = config.onSuccess.call(this, successEvent);
    resolve(handlerResult);
}
