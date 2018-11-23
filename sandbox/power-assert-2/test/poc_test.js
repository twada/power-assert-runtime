'use strict';

delete require.cache[require.resolve('..')];
const assert = require('..');
const transpile = require('../transpile');

function willResolve (value) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(value);
    }, 10);
  });
}

it('assert(foo === bar)', function () {
  const msg = 'assertion';
  const msg2 = 'message';
  const foo = 'FOO';
  const bar = 'BAR';
  try {
    eval(transpile('assert(foo === bar, `${msg} ${msg2}`)'), false);
  } catch (e) {
    console.log(e.message);
  }
});

it('assert.rejects(prms)', async function () {
  const prms = willResolve('good');
  try {
    await eval(transpile('assert.rejects(prms)'), false);
  } catch (e) {
    console.log(e.message);
  }
});
