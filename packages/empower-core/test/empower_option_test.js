'use strict';

const empower = require('..');
const assert = require('assert');

describe('empower.defaultOptions()', () => {
  let options;
  beforeEach(function () {
    options = empower.defaultOptions();
  });
  it('destructive: false', () => {
    assert.strictEqual(options.destructive, false);
  });
  it('bindReceiver: true', () => {
    assert.strictEqual(options.bindReceiver, true);
  });
  it('onError: function', () => {
    assert.strictEqual(typeof options.onError, 'function');
  });
  it('onSuccess: function', () => {
    assert.strictEqual(typeof options.onSuccess, 'function');
  });
  it('onRejected: function', () => {
    assert.strictEqual(typeof options.onRejected, 'function');
  });
  it('onFulfilled: function', () => {
    assert.strictEqual(typeof options.onFulfilled, 'function');
  });
  it('patterns: Array', () => {
    assert.deepStrictEqual(options.patterns, [
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
    ]);
  });
  it('wrapOnlyPatterns: empty Array', () => {
    assert.deepStrictEqual(options.wrapOnlyPatterns, []);
  });
});

describe('empower argument preconditions', () => {
  function argumentTest (name, arg, expectedMessage) {
    expectedMessage = expectedMessage || 'empower-core argument should be a function or object.';
    it(name, () => {
      assert.throws(
        function () {
          empower(arg);
        },
        function (err) {
          return ((err instanceof TypeError) && (expectedMessage === err.message));
        },
        'unexpected error'
      );
    });
  }
  argumentTest('cannot pass null', null);
  argumentTest('cannot pass undefined', undefined);
  argumentTest('cannot pass number', 3);
  argumentTest('cannot pass string', 'hoge');
});

describe('assert object empowerment', () => {
  let fakeAssertObject;
  beforeEach(function () {
    function fail (actual, expected, message, operator) {
      throw new assert.AssertionError({
        message: message,
        actual: actual,
        expected: expected,
        operator: operator
      });
    }
    const assertOk = function (actual, message) {
      if (!actual) {
        fail(actual, true, 'FakeAssert: assertion failed. ' + message, '==');
      }
    };
    fakeAssertObject = {
      ok: assertOk,
      equal: function (actual, expected, message) {
        if (!(actual == expected)) {
          fail(actual, expected, 'FakeAssert: assertion failed. ' + message, '==');
        }
      },
      strictEqual: function (actual, expected, message) {
        if (!(actual === expected)) {
          fail(actual, expected, 'FakeAssert: assertion failed. ' + message, '===');
        }
        return true;
      }
    };
    // this.fakeAssertObject = fakeAssertObject;
  });

  describe('destructive: false', () => {
    let empoweredAssert, options;
    beforeEach(function () {
      options = {
        destructive: false,
        patterns: [
          'assert.ok(value, [message])',
          'assert.equal(actual, expected, [message])',
          'assert.strictEqual(actual, expected, [message])'
        ]
      };
      empoweredAssert = empower(fakeAssertObject, options);
    });
    describe('returned assert', () => {
      it('has ok method', () => {
        assert.strictEqual(typeof empoweredAssert.ok, 'function');
      });
      it('does not have _capt method', () => {
        assert.strictEqual(typeof empoweredAssert._capt, 'undefined');
      });
      it('does not have _expr method', () => {
        assert.strictEqual(typeof empoweredAssert._expr, 'undefined');
      });
      it('has equal method', () => {
        assert.strictEqual(typeof empoweredAssert.equal, 'function');
      });
      it('has strictEqual method', () => {
        assert.strictEqual(typeof empoweredAssert.strictEqual, 'function');
      });
      it('ok method works as assert.ok', () => {
        assert.throws(function () {
          empoweredAssert.ok(false, 'empoweredAssert.ok');
        }, /FakeAssert: assertion failed. empoweredAssert.ok/);
      });
      it('equal method works', () => {
        assert.throws(function () {
          empoweredAssert.strictEqual(1, 'hoge', 'empoweredAssert.equal');
        }, /FakeAssert: assertion failed. empoweredAssert.equal/);
      });
      it('strictEqual method works', () => {
        assert.throws(function () {
          empoweredAssert.strictEqual(1, '1', 'empoweredAssert.strictEqual');
        }, /FakeAssert: assertion failed. empoweredAssert.strictEqual/);
      });
      it('preserve return value if target assertion method returns something', () => {
        const ret = empoweredAssert.strictEqual(1, 1);
        assert.strictEqual(ret, true);
      });

      it('is also an object', () => {
        assert.ok(typeof empoweredAssert, 'object');
      });
      it('is not the same instance as target assert object', () => {
        assert.notStrictEqual(empoweredAssert, fakeAssertObject);
      });
      it('ok method is not refered to target.ok', () => {
        assert.notStrictEqual(empoweredAssert.ok, fakeAssertObject.ok);
      });
    });
    it('avoid empowering multiple times', () => {
      const empoweredAgain = empower(empoweredAssert, options);
      assert.strictEqual(empoweredAgain, empoweredAssert);
    });
  });

  describe('destructive: true', () => {
    let empoweredAssert, options;
    beforeEach(function () {
      options = {
        destructive: true,
        patterns: [
          'assert.ok(value, [message])',
          'assert.equal(actual, expected, [message])',
          'assert.strictEqual(actual, expected, [message])'
        ]
      };
      empoweredAssert = empower(fakeAssertObject, options);
    });
    describe('returned assert', () => {
      it('has ok method', () => {
        assert.strictEqual(typeof empoweredAssert.ok, 'function');
      });
      it('does not have _capt method', () => {
        assert.strictEqual(typeof empoweredAssert._capt, 'undefined');
      });
      it('does not have _expr method', () => {
        assert.strictEqual(typeof empoweredAssert._expr, 'undefined');
      });
      it('has equal method', () => {
        assert.strictEqual(typeof empoweredAssert.equal, 'function');
      });
      it('has strictEqual method', () => {
        assert.strictEqual(typeof empoweredAssert.strictEqual, 'function');
      });
      it('ok method works as assert.ok', () => {
        assert.throws(function () {
          empoweredAssert.ok(false, 'empoweredAssert.ok');
        }, /FakeAssert: assertion failed. empoweredAssert.ok/);
      });
      it('equal method works', () => {
        assert.throws(function () {
          empoweredAssert.strictEqual(1, 'hoge', 'empoweredAssert.equal');
        }, /FakeAssert: assertion failed. empoweredAssert.equal/);
      });
      it('strictEqual method works', () => {
        assert.throws(function () {
          empoweredAssert.strictEqual(1, '1', 'empoweredAssert.strictEqual');
        }, /FakeAssert: assertion failed. empoweredAssert.strictEqual/);
      });
      it('preserve return value if target assertion method returns something', () => {
        const ret = empoweredAssert.strictEqual(1, 1);
        assert.strictEqual(ret, true);
      });

      it('is also an object', () => {
        assert.ok(typeof empoweredAssert, 'object');
      });
      it('is the same instance as target assert object', () => {
        assert.strictEqual(empoweredAssert, fakeAssertObject);
      });
      it('ok method is refered to target.ok', () => {
        assert.strictEqual(empoweredAssert.ok, fakeAssertObject.ok);
      });
    });
    it('avoid empowering multiple times', () => {
      const empoweredAgain = empower(fakeAssertObject, options);
      assert.strictEqual(empoweredAgain, fakeAssertObject);
    });
  });
});

describe('assert function empowerment', () => {
  let fakeAssertFunction;
  beforeEach(function () {
    function fail (actual, expected, message, operator) {
      throw new assert.AssertionError({
        message: message,
        actual: actual,
        expected: expected,
        operator: operator
      });
    }
    const assertOk = function (actual, message) {
      if (!actual) {
        fail(actual, true, 'FakeAssert: assertion failed. ' + message, '==');
      }
      return true;
    };
    assertOk.ok = assertOk;
    assertOk.equal = function (actual, expected, message) {
      if (!(actual == expected)) {
        fail(actual, expected, 'FakeAssert: assertion failed. ' + message, '==');
      }
    };
    assertOk.strictEqual = function (actual, expected, message) {
      if (!(actual === expected)) {
        fail(actual, expected, 'FakeAssert: assertion failed. ' + message, '===');
      }
      return true;
    };
    fakeAssertFunction = assertOk;
  });

  describe('destructive: false', () => {
    let empoweredAssert, options;
    beforeEach(function () {
      options = {
        destructive: false,
        patterns: [
          'assert(value, [message])',
          'assert.ok(value, [message])',
          'assert.equal(actual, expected, [message])',
          'assert.strictEqual(actual, expected, [message])'
        ]
      };
      empoweredAssert = empower(fakeAssertFunction, options);
    });
    describe('returned assert', () => {
      it('has ok method', () => {
        assert.strictEqual(typeof empoweredAssert.ok, 'function');
      });
      it('does not have _capt method', () => {
        assert.strictEqual(typeof empoweredAssert._capt, 'undefined');
      });
      it('does not have _expr method', () => {
        assert.strictEqual(typeof empoweredAssert._expr, 'undefined');
      });
      it('has equal method', () => {
        assert.strictEqual(typeof empoweredAssert.equal, 'function');
      });
      it('has strictEqual method', () => {
        assert.strictEqual(typeof empoweredAssert.strictEqual, 'function');
      });
      it('ok method works as assert.ok', () => {
        assert.throws(function () {
          empoweredAssert.ok(false, 'empoweredAssert.ok');
        }, /FakeAssert: assertion failed. empoweredAssert.ok/);
      });
      it('equal method works', () => {
        assert.throws(function () {
          empoweredAssert.strictEqual(1, 'hoge', 'empoweredAssert.equal');
        }, /FakeAssert: assertion failed. empoweredAssert.equal/);
      });
      it('strictEqual method works', () => {
        assert.throws(function () {
          empoweredAssert.strictEqual(1, '1', 'empoweredAssert.strictEqual');
        }, /FakeAssert: assertion failed. empoweredAssert.strictEqual/);
      });
      it('preserve return value if target assertion method returns something', () => {
        const ret = empoweredAssert.strictEqual(1, 1);
        assert.strictEqual(ret, true);
      });

      it('works as assert function', () => {
        assert.throws(function () {
          empoweredAssert(false, 'empoweredAssert');
        }, /FakeAssert: assertion failed. empoweredAssert/);
      });
      it('is also a function', () => {
        assert.ok(typeof empoweredAssert, 'function');
      });
      it('is not the same instance as target assert function', () => {
        assert.notStrictEqual(empoweredAssert, fakeAssertFunction);
      });
      it('ok method is not refered to target.ok', () => {
        assert.notStrictEqual(empoweredAssert.ok, fakeAssertFunction.ok);
      });
      it('ok method is not refered to target assert function', () => {
        assert.notStrictEqual(empoweredAssert.ok, fakeAssertFunction.ok);
      });
      it('preserve return value if target assertion function itself returns something', () => {
        const ret = empoweredAssert('truthy');
        assert.strictEqual(ret, true);
      });
    });
    it('avoid empowering multiple times', () => {
      const empoweredAgain = empower(empoweredAssert, options);
      assert.strictEqual(empoweredAgain, empoweredAssert);
    });
  });

  it('does not support destructive:true', () => {
    const func = fakeAssertFunction;
    assert.throws(function () {
      empower(func, { destructive: true });
    }, /cannot use destructive:true to function\./);
  });
});
