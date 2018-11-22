const willReject = (value) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(value);
    }, 10);
  });
};

const willResolve = (value) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, 10);
  });
};

module.exports = function ({ empower, baseAssert, weave }) {
  describe('assertions returing Promises', () => {
    describe('assert.rejects', () => {
      let log;
      const assert = empower(baseAssert, {
        patterns: [
          'assert.rejects(block, [error], [message])'
        ],
        onSuccess: function (event) {
          log.push('onSuccess');
          log.push(event);
          baseAssert.strictEqual(event.assertionThrew, false);
          return event.returnValue;
        },
        onError: function onError (event) {
          log.push('onError');
          log.push(event);
          baseAssert(event.error !== undefined);
          baseAssert.strictEqual(event.assertionThrew, true);
          const e = event.error;
          const pe = new baseAssert.AssertionError({
            message: 'powered error: ' + e.message,
            actual: e.actual,
            expected: e.expected,
            operator: e.operator,
            stackStartFunction: e.stackStartFunction || onError
          });
          throw pe;
        }
      });

      beforeEach(() => {
        log = [];
      });

      it('resolves if the block is rejected', async () => {
        const prms = willReject(new Error('foo'));
        const res = await eval(weave('assert.rejects(prms);'));
        baseAssert.strictEqual(log.length, 2);
        baseAssert.strictEqual(log[0], 'onSuccess');
        baseAssert(res === undefined, 'assert.rejects resolves with undefined');
        const event = log[1];
        baseAssert(event.error === undefined);
        baseAssert.strictEqual(event.hasOwnProperty('returnValue'), true);
        baseAssert(event.returnValue === undefined);
        baseAssert.strictEqual(event.enhanced, true);
        baseAssert.strictEqual(event.assertionThrew, false);
        baseAssert.strictEqual(event.assertionFunction, assert.rejects);
      });

      it('rejects with AssertionError if the block is not rejected', async () => {
        try {
          const prms = willResolve('good');
          await eval(weave('assert.rejects(prms);'));
          baseAssert.fail('should not be happen');
        } catch (e) {
          baseAssert(e instanceof baseAssert.AssertionError);
          baseAssert(/^AssertionError/.test(e.name));
          baseAssert.strictEqual(e.message, 'powered error: Missing expected rejection.');
          baseAssert.strictEqual(log.length, 2);
          baseAssert.strictEqual(log[0], 'onError');
          const event = log[1];
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
