'use strict';

// require('@babel/polyfill');
const assert = require('..');

function willResolve (value) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(value);
    }, 100);
  });
}

it('assert(foo)', function () {
  const foo = null;
  assert(foo);
});

it('assert(foo === bar)', function () {
  const foo = 'FOO';
  const bar = 'BAR';
  assert(foo === bar);
});

it('assert(foo === bar) with message literal', function () {
  const foo = 'FOO';
  const bar = 'BAR';
  assert(foo === bar, 'assertion message');
});

it('assert(foo === bar) with message expression', function () {
  const msg = 'assertion';
  const msg2 = 'message';
  const foo = 'FOO';
  const bar = 'BAR';
  assert(foo === bar, `${msg} ${msg2}`);
});

it('assert.deepStrictEqual(foo, bar)', function () {
  const foo = 'FOO';
  const bar = 'BAR';
  assert.deepStrictEqual(foo, bar);
});

it('assert with await', async function () {
  const msg = 'good';
  const msg2 = 'result';
  assert(await willResolve(msg) === await willResolve(msg2));
});

it('assert.rejects', async function () {
  const msg = 'good';
  const msg2 = 'result';
  await assert.rejects(willResolve(`${msg} : ${msg2}`));
});

it('assert.rejects func', async function () {
  const msg = 'good';
  const msg2 = 'result';
  const func = function () {
    return willResolve(`${msg} : ${msg2}`);
  };
  await assert.rejects(func);
});

it('assert.throws func', function () {
  const func = function () {
    return 'does not throw';
  };
  assert.throws(func);
});

it('assert.throws func, obj', function () {
  const func = function () {
    return 'does not throw';
  };
  const matcher = {
    name: 'TypeError',
    code: 'ERR_INVALID_ARG_TYPE'
  };
  assert.throws(func, matcher);
});

it('assert.throws func(does not throw), func', function () {
  const func = function () {
    return 'does not throw';
  };
  const validate = function (err) {
    return ((err instanceof TypeError) && /wrong/.test(err));
  };
  assert.throws(func, validate);
});

it('assert.throws func(throws), func', function () {
  const func = function () {
    throw new Error('BOOOM');
  };
  const validate = function (err) {
    return ((err instanceof TypeError) && /wrong/.test(err));
  };
  assert.throws(func, validate);
});

it('assert.doesNotThrow func', function () {
  const func = function () {
    const te = new TypeError('an Error has occurred');
    te.code = 'ERR_AMBIGUOUS_ARGUMENT';
    throw te;
  };
  assert.doesNotThrow(func);
});
