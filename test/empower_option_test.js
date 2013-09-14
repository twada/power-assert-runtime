var empower = require('../lib/empower'),
    assert = require('assert');


suite('empower.defaultOptions()', function () {
    setup (function () {
        this.options = empower.defaultOptions();
    });
    test('destructive: false', function () {
        assert.equal(this.options.destructive, false);
    });
    test('formatter: power-assert-formatter module', function () {
        assert.deepEqual(this.options.formatter, require('../lib/power-assert-formatter'));
    });
});



suite('assert object empowerment', function () {

test('destructive: false', function () {
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
    assert.ok(typeof empoweredAssert === 'object');
    assert.ok(typeof empoweredAssert.ok === 'function');
    assert.ok(typeof empoweredAssert._capt === 'function');
    assert.ok(typeof empoweredAssert._expr === 'function');
    assert.ok(typeof empoweredAssert.equal === 'function');
    assert.ok(typeof empoweredAssert.strictEqual === 'function');

    assert.notEqual(empoweredAssert, fakeAssertObject);
    assert.notEqual(empoweredAssert.ok, fakeAssertObject.ok);
    assert.equal(fakeAssertObject.ok, assertOk);

    try {
        empoweredAssert.ok(false, 'empoweredAssert.ok');
    } catch (e) {
        assert.ok(e instanceof Error);
        assert.equal(e.message, 'FakeAssert: assertion failed. empoweredAssert.ok');
    }

    try {
        empoweredAssert.strictEqual(1, '1', 'empoweredAssert.strictEqual');
    } catch (e) {
        assert.ok(e instanceof Error);
        assert.equal(e.message, 'FakeAssert: assertion failed. empoweredAssert.strictEqual');
    }

    var empoweredAgain = empower(empoweredAssert, {destructive: false});
    assert.equal(empoweredAgain, empoweredAssert, 'avoid empowering multiple times');
});


test('destructive: true', function () {
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
    assert.ok(typeof fakeAssertObject === 'object');
    assert.ok(typeof fakeAssertObject.ok === 'function');
    assert.ok(typeof fakeAssertObject._capt === 'function');
    assert.ok(typeof fakeAssertObject._expr === 'function');
    assert.ok(typeof fakeAssertObject.equal === 'function');
    assert.ok(typeof fakeAssertObject.strictEqual === 'function');

    assert.notEqual(fakeAssertObject.ok, assertOk);

    try {
        fakeAssertObject.ok(false, 'fakeAssertObject.ok');
    } catch (e) {
        assert.ok(e instanceof Error);
        assert.equal(e.message, 'FakeAssert: assertion failed. fakeAssertObject.ok');
    }

    try {
        fakeAssertObject.strictEqual(1, '1', 'fakeAssertObject.strictEqual');
    } catch (e) {
        assert.ok(e instanceof Error);
        assert.equal(e.message, 'FakeAssert: assertion failed. fakeAssertObject.strictEqual');
    }

    var empoweredAgain = empower(fakeAssertObject, {destructive: true});
    assert.equal(empoweredAgain, fakeAssertObject, 'avoid empowering multiple times');
});

});




suite('assert function empowerment', function () {

test('destructive: false', function () {
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
    assert.ok(typeof empoweredAssert === 'function');
    assert.ok(typeof empoweredAssert.ok === 'function');
    assert.ok(typeof empoweredAssert._capt === 'function');
    assert.ok(typeof empoweredAssert._expr === 'function');
    assert.ok(typeof empoweredAssert.equal === 'function');
    assert.ok(typeof empoweredAssert.strictEqual === 'function');

    assert.notEqual(empoweredAssert, assertOk);
    assert.notEqual(empoweredAssert.ok, assertOk);

    try {
        empoweredAssert.ok(false, 'empoweredAssert.ok');
    } catch (e) {
        assert.ok(e instanceof Error);
        assert.equal(e.message, 'FakeAssert: assertion failed. empoweredAssert.ok');
    }

    try {
        empoweredAssert.strictEqual(1, '1', 'empoweredAssert.strictEqual');
    } catch (e) {
        assert.ok(e instanceof Error);
        assert.equal(e.message, 'FakeAssert: assertion failed. empoweredAssert.strictEqual');
    }

    var empoweredAgain = empower(empoweredAssert, {destructive: false});
    assert.equal(empoweredAgain, empoweredAssert, 'avoid empowering multiple times');
});

});
