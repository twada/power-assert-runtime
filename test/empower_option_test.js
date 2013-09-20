var empower = require('../lib/empower'),
    instrument = require('../test_helper').instrument,
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


suite('lineSeparator option', function () {
    function lineSeparatorTest (name, option, expectedSeparator) {
        var baseAssert = require('assert'),
            assert = empower(baseAssert, option);
        test(name, function () {
            var falsyNum = 0;
            try {
                assert(eval(instrument('assert(falsyNum);')));
            } catch (e) {
                baseAssert.equal(e.message, [
                    '# /path/to/some_test.js:1',
                    '',
                    'assert(falsyNum);',
                    '       |         ',
                    '       0         ',
                    ''
                ].join(expectedSeparator));
            }
        });
    }
    lineSeparatorTest('default is LF', {}, '\n');
    lineSeparatorTest('LF', {lineSeparator: '\n'}, '\n');
    lineSeparatorTest('CR', {lineSeparator: '\r'}, '\r');
    lineSeparatorTest('CRLF', {lineSeparator: '\r\n'}, '\r\n');
});


function sharedTestsForEmpowerFunctionReturnValue () {
    test('has ok method', function () {
        assert.equal(typeof this.empoweredAssert.ok, 'function');
    });
    test('has _capt method', function () {
        assert.equal(typeof this.empoweredAssert._capt, 'function');
    });
    test('has _expr method', function () {
        assert.equal(typeof this.empoweredAssert._expr, 'function');
    });
    test('has equal method', function () {
        assert.equal(typeof this.empoweredAssert.equal, 'function');
    });
    test('has strictEqual method', function () {
        assert.equal(typeof this.empoweredAssert.strictEqual, 'function');
    });
    test('ok method works as assert.ok', function () {
        var empoweredAssert = this.empoweredAssert;
        assert.throws(function () {
            empoweredAssert.ok(false, 'empoweredAssert.ok');
        }, /FakeAssert: assertion failed. empoweredAssert.ok/);
    });
    test('equal method works', function () {
        var empoweredAssert = this.empoweredAssert;
        assert.throws(function () {
            empoweredAssert.equal(1, 'hoge', 'empoweredAssert.equal');
        }, /FakeAssert: assertion failed. empoweredAssert.equal/);
    });
    test('strictEqual method works', function () {
        var empoweredAssert = this.empoweredAssert;
        assert.throws(function () {
            empoweredAssert.strictEqual(1, '1', 'empoweredAssert.strictEqual');
        }, /FakeAssert: assertion failed. empoweredAssert.strictEqual/);
    });
}


suite('assert object empowerment', function () {
    setup(function () {
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
        this.fakeAssertObject = fakeAssertObject;
    });

    suite('destructive: false', function () {
        setup(function () {
            this.empoweredAssert = empower(this.fakeAssertObject, {destructive: false});
        });
        suite('returned assert', function () {
            sharedTestsForEmpowerFunctionReturnValue();
            test('is also an object', function () {
                assert.ok(typeof this.empoweredAssert, 'object');
            });
            test('is not the same instance as target assert object', function () {
                assert.notEqual(this.empoweredAssert, this.fakeAssertObject);
            });
            test('ok method is not refered to target.ok', function () {
                assert.notEqual(this.empoweredAssert.ok, this.fakeAssertObject.ok);
            });
        });
        test('avoid empowering multiple times', function () {
            var empoweredAgain = empower(this.empoweredAssert, {destructive: false});
            assert.equal(empoweredAgain, this.empoweredAssert);
        });
    });

    suite('destructive: true', function () {
        setup(function () {
            this.empoweredAssert = empower(this.fakeAssertObject, {destructive: true});
        });
        suite('returned assert', function () {
            sharedTestsForEmpowerFunctionReturnValue();
            test('is also an object', function () {
                assert.ok(typeof this.empoweredAssert, 'object');
            });
            test('is the same instance as target assert object', function () {
                assert.equal(this.empoweredAssert, this.fakeAssertObject);
            });
            test('ok method is refered to target.ok', function () {
                assert.equal(this.empoweredAssert.ok, this.fakeAssertObject.ok);
            });
        });
        test('avoid empowering multiple times', function () {
            var empoweredAgain = empower(this.fakeAssertObject, {destructive: true});
            assert.equal(empoweredAgain, this.fakeAssertObject);
        });
    });
});


suite('assert function empowerment', function () {
    setup(function () {
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
        this.fakeAssertFunction = assertOk;
    });

    suite('destructive: false', function () {
        setup(function () {
            this.empoweredAssert = empower(this.fakeAssertFunction, {destructive: false});
        });
        suite('returned assert', function () {
            sharedTestsForEmpowerFunctionReturnValue();
            test('is also a function', function () {
                assert.ok(typeof this.empoweredAssert, 'function');
            });
            test('is not the same instance as target assert function', function () {
                assert.notEqual(this.empoweredAssert, this.fakeAssertFunction);
            });
            test('ok method is not refered to target.ok', function () {
                assert.notEqual(this.empoweredAssert.ok, this.fakeAssertFunction.ok);
            });
            test('ok method is not refered to target assert function', function () {
                assert.notEqual(this.empoweredAssert.ok, this.fakeAssertFunction.ok);
            });
        });
        test('avoid empowering multiple times', function () {
            var empoweredAgain = empower(this.empoweredAssert, {destructive: false});
            assert.equal(empoweredAgain, this.empoweredAssert);
        });
    });

    test('does not support destructive:true', function () {
        var func = this.fakeAssertFunction;
        assert.throws(function () {
            empower(func, {destructive: true});
        }, 'cannot use destructive:true to function\.');
    });
});


suite('empower argument preconditions', function () {
    function argumentTest (name, arg, expectedMessage) {
        expectedMessage = expectedMessage || 'empower argument should be a function or object.';
        test(name, function () {
            assert.throws(
                function() {
                    empower(arg);
                },
                function(err) {
                    return ((err instanceof TypeError) && (expectedMessage === err.message));
                },
                "unexpected error"
            );
        });
    }
    argumentTest('cannot pass null', null);
    argumentTest('cannot pass undefined', undefined);
    argumentTest('cannot pass number', 3);
    argumentTest('cannot pass string', 'hoge');
    argumentTest('should respond to "ok"', {equal: function () { return false; }}, 'empower target object should be respond to \'ok\' method.');
});
