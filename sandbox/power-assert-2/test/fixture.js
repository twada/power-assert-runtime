'use strict';

// require('@babel/polyfill');
const assert = require('..');

const willResolve = (value) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, 100);
  });
};

it('assert(foo)', () => {
  const foo = null;
  assert(foo);
});

it('assert(foo === bar)', () => {
  const foo = 'FOO';
  const bar = 'BAR';
  assert(foo === bar);
});

it('assert(foo === bar) with message literal', () => {
  const foo = 'FOO';
  const bar = 'BAR';
  assert(foo === bar, 'assertion message');
});

it('assert(foo === bar) with message expression', () => {
  const msg = 'assertion';
  const msg2 = 'message';
  const foo = 'FOO';
  const bar = 'BAR';
  assert(foo === bar, `${msg} ${msg2}`);
});

it('assert.equal(foo, bar)', () => {
  const foo = 'FOO';
  const bar = 'BAR';
  assert.equal(foo, bar);
});

it('assert.equal("foo", bar)', () => {
  const bar = 'BAR';
  assert.equal('foo', bar);
});

it('assert.equal(foo, "bar")', () => {
  const foo = 'FOO';
  assert.equal(foo, 'bar');
});

it('assert.deepStrictEqual(foo, bar)', () => {
  const foo = {
    children: [
      {name: 'FOO'},
      {name: 'bar'},
    ]
  };
  const bar = [
    {name: 'FOO'},
    {name: 'bar'},
  ];
  assert.deepStrictEqual(foo, bar);
});

it('assert with await', async () => {
  const msg = 'good';
  const msg2 = 'result';
  assert(await willResolve(msg) === await willResolve(msg2));
});

it('assert.rejects', async () => {
  const msg = 'good';
  const msg2 = 'result';
  await assert.rejects(willResolve(`${msg} : ${msg2}`));
});

it('assert.rejects func', async () => {
  const msg = 'good';
  const msg2 = 'result';
  const func = () => {
    return willResolve(`${msg} : ${msg2}`);
  };
  await assert.rejects(func);
});

it('assert.throws func', () => {
  const func = () => {
    return 'does not throw';
  };
  assert.throws(func);
});

it('assert.throws func, obj', () => {
  const func = () => {
    return 'does not throw';
  };
  const matcher = {
    name: 'TypeError',
    code: 'ERR_INVALID_ARG_TYPE'
  };
  assert.throws(func, matcher);
});

it('assert.throws func(does not throw), func', () => {
  const func = () => {
    return 'does not throw';
  };
  const validate = (err) => {
    return ((err instanceof TypeError) && /wrong/.test(err));
  };
  assert.throws(func, validate);
});

it('assert.throws func(throws), func->false', () => {
  const func = () => {
    throw new Error('BOOOM');
  };
  const validate = (err) => {
    return ((err instanceof TypeError) && /wrong/.test(err));
  };
  assert.throws(func, validate);
});

it('assert.doesNotThrow func', () => {
  const func = () => {
    const te = new TypeError('an Error has occurred');
    te.code = 'ERR_AMBIGUOUS_ARGUMENT';
    throw te;
  };
  assert.doesNotThrow(func);
});
