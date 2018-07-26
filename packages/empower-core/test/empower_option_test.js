'use strict';

var empower = require('..');
var assert = require('assert');

describe('empower.defaultOptions()', function () {
    beforeEach(function () {
        this.options = empower.defaultOptions();
    });
    it('destructive: false', function () {
        assert.equal(this.options.destructive, false);
    });
    it('bindReceiver: true', function () {
        assert.equal(this.options.bindReceiver, true);
    });
    it('onError: function', function () {
        assert.equal(typeof this.options.onError, 'function');
    });
    it('onSuccess: function', function () {
        assert.equal(typeof this.options.onSuccess, 'function');
    });
    it('patterns: Array', function () {
        assert.deepEqual(this.options.patterns, [
            'assert(value, [message])',
            'assert.ok(value, [message])',
            'assert.equal(actual, expected, [message])',
            'assert.notEqual(actual, expected, [message])',
            'assert.strictEqual(actual, expected, [message])',
            'assert.notStrictEqual(actual, expected, [message])',
            'assert.deepEqual(actual, expected, [message])',
            'assert.notDeepEqual(actual, expected, [message])',
            'assert.deepStrictEqual(actual, expected, [message])',
            'assert.notDeepStrictEqual(actual, expected, [message])'
        ]);
    });
    it('wrapOnlyPatterns: empty Array', function () {
        assert.deepEqual(this.options.wrapOnlyPatterns, []);
    });
});


describe('empower argument preconditions', function () {
    function argumentTest (name, arg, expectedMessage) {
        expectedMessage = expectedMessage || 'empower-core argument should be a function or object.';
        it(name, function () {
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
});


function sharedTestsForEmpowerFunctionReturnValue () {
    it('has ok method', function () {
        assert.equal(typeof this.empoweredAssert.ok, 'function');
    });
    it('does not have _capt method', function () {
        assert.equal(typeof this.empoweredAssert._capt, 'undefined');
    });
    it('does not have _expr method', function () {
        assert.equal(typeof this.empoweredAssert._expr, 'undefined');
    });
    it('has equal method', function () {
        assert.equal(typeof this.empoweredAssert.equal, 'function');
    });
    it('has strictEqual method', function () {
        assert.equal(typeof this.empoweredAssert.strictEqual, 'function');
    });
    it('ok method works as assert.ok', function () {
        var empoweredAssert = this.empoweredAssert;
        assert.throws(function () {
            empoweredAssert.ok(false, 'empoweredAssert.ok');
        }, /FakeAssert: assertion failed. empoweredAssert.ok/);
    });
    it('equal method works', function () {
        var empoweredAssert = this.empoweredAssert;
        assert.throws(function () {
            empoweredAssert.equal(1, 'hoge', 'empoweredAssert.equal');
        }, /FakeAssert: assertion failed. empoweredAssert.equal/);
    });
    it('strictEqual method works', function () {
        var empoweredAssert = this.empoweredAssert;
        assert.throws(function () {
            empoweredAssert.strictEqual(1, '1', 'empoweredAssert.strictEqual');
        }, /FakeAssert: assertion failed. empoweredAssert.strictEqual/);
    });
    it('preserve return value if target assertion method returns something', function () {
        var empoweredAssert = this.empoweredAssert,
            ret = empoweredAssert.equal(1, '1');
        empoweredAssert.strictEqual(ret, true);
    });
}


describe('assert object empowerment', function () {
    beforeEach(function () {
        function fail(actual, expected, message, operator) {
            throw new assert.AssertionError({
                message: message,
                actual: actual,
                expected: expected,
                operator: operator
            });
        }
        var assertOk = function (actual, message) {
            if (!actual) {
                fail(actual, true, 'FakeAssert: assertion failed. ' + message, '==');
            }
        };
        var fakeAssertObject = {
            ok: assertOk,
            equal: function (actual, expected, message) {
                if (!(actual == expected)) {
                    fail(actual, expected, 'FakeAssert: assertion failed. ' + message, '==');
                }
                return true;
            },
            strictEqual: function (actual, expected, message) {
                if (!(actual === expected)) {
                    fail(actual, expected, 'FakeAssert: assertion failed. ' + message, '===');
                }
            }
        };
        this.fakeAssertObject = fakeAssertObject;
    });

    describe('destructive: false', function () {
        beforeEach(function () {
            this.options = {
                destructive: false,
                patterns: [
                    'assert.ok(value, [message])',
                    'assert.equal(actual, expected, [message])',
                    'assert.strictEqual(actual, expected, [message])'
                ]
            };
            this.empoweredAssert = empower(this.fakeAssertObject, this.options);
        });
        describe('returned assert', function () {
            sharedTestsForEmpowerFunctionReturnValue();
            it('is also an object', function () {
                assert.ok(typeof this.empoweredAssert, 'object');
            });
            it('is not the same instance as target assert object', function () {
                assert.notEqual(this.empoweredAssert, this.fakeAssertObject);
            });
            it('ok method is not refered to target.ok', function () {
                assert.notEqual(this.empoweredAssert.ok, this.fakeAssertObject.ok);
            });
        });
        it('avoid empowering multiple times', function () {
            var empoweredAgain = empower(this.empoweredAssert, this.options);
            assert.equal(empoweredAgain, this.empoweredAssert);
        });
    });

    describe('destructive: true', function () {
        beforeEach(function () {
            this.options = {
                destructive: true,
                patterns: [
                    'assert.ok(value, [message])',
                    'assert.equal(actual, expected, [message])',
                    'assert.strictEqual(actual, expected, [message])'
                ]
            };
            this.empoweredAssert = empower(this.fakeAssertObject, this.options);
        });
        describe('returned assert', function () {
            sharedTestsForEmpowerFunctionReturnValue();
            it('is also an object', function () {
                assert.ok(typeof this.empoweredAssert, 'object');
            });
            it('is the same instance as target assert object', function () {
                assert.equal(this.empoweredAssert, this.fakeAssertObject);
            });
            it('ok method is refered to target.ok', function () {
                assert.equal(this.empoweredAssert.ok, this.fakeAssertObject.ok);
            });
        });
        it('avoid empowering multiple times', function () {
            var empoweredAgain = empower(this.fakeAssertObject, this.options);
            assert.equal(empoweredAgain, this.fakeAssertObject);
        });
    });
});


describe('assert function empowerment', function () {
    beforeEach(function () {
        function fail(actual, expected, message, operator) {
            throw new assert.AssertionError({
                message: message,
                actual: actual,
                expected: expected,
                operator: operator
            });
        }
        var assertOk = function (actual, message) {
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
            return true;
        };
        assertOk.strictEqual = function (actual, expected, message) {
            if (!(actual === expected)) {
                fail(actual, expected, 'FakeAssert: assertion failed. ' + message, '===');
            }
        };
        this.fakeAssertFunction = assertOk;
    });

    describe('destructive: false', function () {
        beforeEach(function () {
            this.options = {
                destructive: false,
                patterns: [
                    'assert(value, [message])',
                    'assert.ok(value, [message])',
                    'assert.equal(actual, expected, [message])',
                    'assert.strictEqual(actual, expected, [message])'
                ]
            };
            this.empoweredAssert = empower(this.fakeAssertFunction, this.options);
        });
        describe('returned assert', function () {
            sharedTestsForEmpowerFunctionReturnValue();
            it('works as assert function', function () {
                var empoweredAssert = this.empoweredAssert;
                assert.throws(function () {
                    empoweredAssert(false, 'empoweredAssert');
                }, /FakeAssert: assertion failed. empoweredAssert/);
            });
            it('is also a function', function () {
                assert.ok(typeof this.empoweredAssert, 'function');
            });
            it('is not the same instance as target assert function', function () {
                assert.notEqual(this.empoweredAssert, this.fakeAssertFunction);
            });
            it('ok method is not refered to target.ok', function () {
                assert.notEqual(this.empoweredAssert.ok, this.fakeAssertFunction.ok);
            });
            it('ok method is not refered to target assert function', function () {
                assert.notEqual(this.empoweredAssert.ok, this.fakeAssertFunction.ok);
            });
            it('preserve return value if target assertion function itself returns something', function () {
                var empoweredAssert = this.empoweredAssert,
                    ret = empoweredAssert('truthy');
                empoweredAssert.strictEqual(ret, true);
            });
        });
        it('avoid empowering multiple times', function () {
            var empoweredAgain = empower(this.empoweredAssert, this.options);
            assert.equal(empoweredAgain, this.empoweredAssert);
        });
    });

    it('does not support destructive:true', function () {
        var func = this.fakeAssertFunction;
        assert.throws(function () {
            empower(func, {destructive: true});
        }, /cannot use destructive:true to function\./);
    });
});
