var q = require('../test_helper').QUnit,
    empower = require('../lib/empower');


q.module('assert object empowerment');

q.test('destructive: false', function () {
    var assertOk = function (actual, message) {
        if (!actual) {
            throw new Error('FakeAssert: assertion failed. ' + message);
        }
    };
    var fakeAssertObject = {
        ok: assertOk
    };

    var empoweredAssert = empower(fakeAssertObject, {destructive: false});
    q.ok(typeof empoweredAssert === 'object');
    q.ok(typeof empoweredAssert.ok === 'function');
    q.ok(typeof empoweredAssert._capt === 'function');
    q.ok(typeof empoweredAssert._expr === 'function');
    q.notEqual(empoweredAssert, fakeAssertObject);
    q.notEqual(empoweredAssert.ok, fakeAssertObject.ok);
    q.equal(fakeAssertObject.ok, assertOk);
    q.throws(function () {
        empoweredAssert.ok(false);
    }, Error, 'Error should be thrown');
});

q.test('destructive: true', function () {
    var assertOk = function (actual, message) {
        if (!actual) {
            throw new Error('FakeAssert: assertion failed. ' + message);
        }
    };
    var fakeAssertObject = {
        ok: assertOk
    };

    empower(fakeAssertObject, {destructive: true});
    q.ok(typeof fakeAssertObject === 'object');
    q.ok(typeof fakeAssertObject.ok === 'function');
    q.ok(typeof fakeAssertObject._capt === 'function');
    q.ok(typeof fakeAssertObject._expr === 'function');
    q.notEqual(fakeAssertObject.ok, assertOk);
    q.throws(function () {
        fakeAssertObject.ok(false);
    }, Error, 'Error should be thrown');
});



q.module('assert function empowerment');

q.test('destructive: false', function () {
    var assertOk = function (actual, message) {
        if (!actual) {
            throw new Error('FakeAssert: assertion failed. ' + message);
        }
    };
    assertOk.ok = assertOk;

    var empoweredAssert = empower(assertOk, {destructive: false});
    q.ok(typeof empoweredAssert === 'function');
    q.ok(typeof empoweredAssert.ok === 'function');
    q.ok(typeof empoweredAssert._capt === 'function');
    q.ok(typeof empoweredAssert._expr === 'function');
    q.notEqual(empoweredAssert, assertOk);
    q.notEqual(empoweredAssert.ok, assertOk);
    q.throws(function () {
        empoweredAssert(false);
    }, Error, 'Error should be thrown');
});
