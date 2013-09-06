var q = require('../test_helper').QUnit,
    empower = require('../lib/empower');


q.module('empower.defaultOptions()', {
    setup: function () {
        this.options = empower.defaultOptions();
    }
});
q.test('destructive: false', function () {
    q.equal(this.options.destructive, false);
});
q.test('formatter: power-assert-formatter module', function () {
    q.deepEqual(this.options.formatter, require('../lib/power-assert-formatter'));
});



q.module('assert object empowerment');

q.test('destructive: false', function () {
    var assertOk = function (actual, message) {
        if (!actual) {
            throw new Error('FakeAssert: assertion failed. ' + message);
        }
    };
    var fakeAssertObject = {
        ok: assertOk,
        equal: function (actual, expected, message) {
            this.ok(actual == expected, message);
        },
        strictEqual: function (actual, expected, message) {
            this.ok(actual === expected, message);
        }
    };

    var empoweredAssert = empower(fakeAssertObject, {destructive: false});
    q.ok(typeof empoweredAssert === 'object');
    q.ok(typeof empoweredAssert.ok === 'function');
    q.ok(typeof empoweredAssert._capt === 'function');
    q.ok(typeof empoweredAssert._expr === 'function');
    q.ok(typeof empoweredAssert.equal === 'function');
    q.ok(typeof empoweredAssert.strictEqual === 'function');

    q.notEqual(empoweredAssert, fakeAssertObject);
    q.notEqual(empoweredAssert.ok, fakeAssertObject.ok);
    q.equal(fakeAssertObject.ok, assertOk);

    try {
        empoweredAssert.ok(false, 'empoweredAssert.ok');
    } catch (e) {
        q.ok(e instanceof Error);
        q.equal(e.message, 'FakeAssert: assertion failed. empoweredAssert.ok');
    }

    try {
        empoweredAssert.strictEqual(1, '1', 'empoweredAssert.strictEqual');
    } catch (e) {
        q.ok(e instanceof Error);
        q.equal(e.message, 'FakeAssert: assertion failed. empoweredAssert.strictEqual');
    }

    var empoweredAgain = empower(empoweredAssert, {destructive: false});
    q.equal(empoweredAgain, empoweredAssert, 'avoid empowering multiple times');
});


q.test('destructive: true', function () {
    var assertOk = function (actual, message) {
        if (!actual) {
            throw new Error('FakeAssert: assertion failed. ' + message);
        }
    };
    var fakeAssertObject = {
        ok: assertOk,
        equal: function (actual, expected, message) {
            this.ok(actual == expected, message);
        },
        strictEqual: function (actual, expected, message) {
            this.ok(actual === expected, message);
        }
    };

    empower(fakeAssertObject, {destructive: true});
    q.ok(typeof fakeAssertObject === 'object');
    q.ok(typeof fakeAssertObject.ok === 'function');
    q.ok(typeof fakeAssertObject._capt === 'function');
    q.ok(typeof fakeAssertObject._expr === 'function');
    q.ok(typeof fakeAssertObject.equal === 'function');
    q.ok(typeof fakeAssertObject.strictEqual === 'function');

    q.notEqual(fakeAssertObject.ok, assertOk);

    try {
        fakeAssertObject.ok(false, 'fakeAssertObject.ok');
    } catch (e) {
        q.ok(e instanceof Error);
        q.equal(e.message, 'FakeAssert: assertion failed. fakeAssertObject.ok');
    }

    try {
        fakeAssertObject.strictEqual(1, '1', 'fakeAssertObject.strictEqual');
    } catch (e) {
        q.ok(e instanceof Error);
        q.equal(e.message, 'FakeAssert: assertion failed. fakeAssertObject.strictEqual');
    }

    var empoweredAgain = empower(fakeAssertObject, {destructive: true});
    q.equal(empoweredAgain, fakeAssertObject, 'avoid empowering multiple times');
});



q.module('assert function empowerment');

q.test('destructive: false', function () {
    var assertOk = function (actual, message) {
        if (!actual) {
            throw new Error('FakeAssert: assertion failed. ' + message);
        }
    };
    assertOk.ok = assertOk;
    assertOk.equal = function (actual, expected, message) {
        this.ok(actual == expected, message);
    };
    assertOk.strictEqual = function (actual, expected, message) {
        this.ok(actual === expected, message);
    };

    var empoweredAssert = empower(assertOk, {destructive: false});
    q.ok(typeof empoweredAssert === 'function');
    q.ok(typeof empoweredAssert.ok === 'function');
    q.ok(typeof empoweredAssert._capt === 'function');
    q.ok(typeof empoweredAssert._expr === 'function');
    q.ok(typeof empoweredAssert.equal === 'function');
    q.ok(typeof empoweredAssert.strictEqual === 'function');

    q.notEqual(empoweredAssert, assertOk);
    q.notEqual(empoweredAssert.ok, assertOk);

    try {
        empoweredAssert.ok(false, 'empoweredAssert.ok');
    } catch (e) {
        q.ok(e instanceof Error);
        q.equal(e.message, 'FakeAssert: assertion failed. empoweredAssert.ok');
    }

    try {
        empoweredAssert.strictEqual(1, '1', 'empoweredAssert.strictEqual');
    } catch (e) {
        q.ok(e instanceof Error);
        q.equal(e.message, 'FakeAssert: assertion failed. empoweredAssert.strictEqual');
    }

    var empoweredAgain = empower(empoweredAssert, {destructive: false});
    q.equal(empoweredAgain, empoweredAssert, 'avoid empowering multiple times');
});
