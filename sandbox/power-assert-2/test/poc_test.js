'use strict';

delete require.cache[require.resolve('..')];
var assert = require('..');
var transpile = require('../transpile');

function willResolve (value) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(value);
        }, 10);
    });
}

it('assert(foo === bar)', function () {
    var msg = 'assertion';
    var msg2 = 'message';
    var foo = 'FOO';
    var bar = 'BAR';
    try {
        eval(transpile('assert(foo === bar, `${msg} ${msg2}`)'), false);
    } catch (e) {
        console.log(e.message);
    }
});

it('assert.rejects(prms)', async function () {
    var prms = willResolve('good');
    try {
        await eval(transpile('assert.rejects(prms)'), false);
    } catch (e) {
        console.log(e.message);
    }
});
