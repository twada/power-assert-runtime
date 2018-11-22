'use strict';

// require('@babel/polyfill');
var assert = require('..');

function willResolve (value) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(value);
        }, 100);
    });
}

it('assert(foo)', function () {
    var foo = null;
    assert(foo);
});

it('assert(foo === bar)', function () {
    var foo = 'FOO';
    var bar = 'BAR';
    assert(foo === bar);
});

it('assert(foo === bar) with message literal', function () {
    var foo = 'FOO';
    var bar = 'BAR';
    assert(foo === bar, 'assertion message');
});

it('assert(foo === bar) with message expression', function () {
    var msg = 'assertion';
    var msg2 = 'message';
    var foo = 'FOO';
    var bar = 'BAR';
    assert(foo === bar, `${msg} ${msg2}`);
});

it('assert.deepStrictEqual(foo, bar)', function () {
    var foo = 'FOO';
    var bar = 'BAR';
    assert.deepStrictEqual(foo, bar);
});

it('assert with await', async function () {
    var msg = 'good';
    var msg2 = 'result';
    assert(await willResolve(msg) === await willResolve(msg2));
});

it('assert.rejects', async function () {
    var msg = 'good';
    var msg2 = 'result';
    await assert.rejects(willResolve(`${msg} : ${msg2}`));
});

it('assert.rejects func', async function () {
    var msg = 'good';
    var msg2 = 'result';
    var func = function () {
        return willResolve(`${msg} : ${msg2}`);
    };
    await assert.rejects(func);
});

it('assert.throws func', function () {
    var func = function () {
        return 'does not throw';
    };
    assert.throws(func);
});

it('assert.throws func, obj', function () {
    var func = function () {
        return 'does not throw';
    };
    var matcher = {
        name: 'TypeError',
        code: 'ERR_INVALID_ARG_TYPE'
    };
    assert.throws(func, matcher);
});

it('assert.throws func(does not throw), func', function () {
    var func = function () {
        return 'does not throw';
    };
    var validate = function (err) {
        return ((err instanceof TypeError) && /wrong/.test(err));
    };
    assert.throws(func, validate);
});

it('assert.throws func(throws), func', function () {
    var func = function () {
        throw new Error('BOOOM');
    };
    var validate = function (err) {
        return ((err instanceof TypeError) && /wrong/.test(err));
    };
    assert.throws(func, validate);
});

it('assert.doesNotThrow func', function () {
    var func = function () {
        var te = new TypeError('an Error has occurred');
        te.code = 'ERR_AMBIGUOUS_ARGUMENT';
        throw te;
    };
    assert.doesNotThrow(func);
});
