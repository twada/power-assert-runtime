function willReject (value) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject(value);
        }, 10);
    });
}

function willResolve (value) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(value);
        }, 10);
    });
}

module.exports = function ({empower, baseAssert, weave}) {

    describe('assertions returing Promises', function () {

        describe('assert.rejects', function () {
            var log;
            var assert = empower(baseAssert, {
                patterns: [
                    'assert.rejects(block, [error], [message])'
                ],
                onSuccess: function (event) {
                    log.push('onSuccess');
                    log.push(event);
                    baseAssert.equal(event.assertionThrew, false);
                    return event.returnValue;
                },
                onError: function onError (event) {
                    log.push('onError');
                    log.push(event);
                    baseAssert(event.error !== undefined);
                    baseAssert.equal(event.assertionThrew, true);
                    var e = event.error;
                    var pe = new baseAssert.AssertionError({
                        message: 'powered error: ' + e.message,
                        actual: e.actual,
                        expected: e.expected,
                        operator: e.operator,
                        stackStartFunction: e.stackStartFunction || onError
                    });
                    throw pe;
                }
            });

            beforeEach(function () {
                log = [];
            });

            it('resolves if the block is rejected', async function () {
                var prms = willReject(new Error('foo'));
                var res = await eval(weave("assert.rejects(prms);"));
                baseAssert.equal(log.length, 2);
                baseAssert.equal(log[0], 'onSuccess');
                baseAssert(res === undefined, 'assert.rejects resolves with undefined');
                var event = log[1];
                baseAssert(event.error === undefined);
                baseAssert.strictEqual(event.hasOwnProperty('returnValue'), true);
                baseAssert(event.returnValue === undefined);
                baseAssert.strictEqual(event.enhanced, true);
                baseAssert.strictEqual(event.assertionThrew, false);
                baseAssert.strictEqual(event.assertionFunction, assert.rejects);
            });

            it('rejects with AssertionError if the block is not rejected', async function () {
                try {
                    var prms = willResolve('good');
                    await eval(weave("assert.rejects(prms);"));
                    baseAssert.fail('should not be happen');
                } catch (e) {
                    baseAssert(e instanceof baseAssert.AssertionError);
                    baseAssert(/^AssertionError/.test(e.name));
                    baseAssert.strictEqual(e.message, 'powered error: Missing expected rejection.');
                    baseAssert.equal(log.length, 2);
                    baseAssert.equal(log[0], 'onError');
                    var event = log[1];
                    baseAssert(event.error !== undefined);
                    baseAssert.strictEqual(event.hasOwnProperty('returnValue'), false);
                    baseAssert.strictEqual(event.enhanced, true);
                    baseAssert.strictEqual(event.assertionThrew, true);
                    baseAssert.strictEqual(event.assertionFunction, assert.rejects);
                }
            });
        });
    });
};
