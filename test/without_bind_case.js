(function (root, factory) {
    'use strict';

    var dependencies = [
        '../lib/empower',
        'assert'
    ];

    if (typeof define === 'function' && define.amd) {
        define(dependencies, factory);
    } else if (typeof exports === 'object') {
        factory.apply(root, dependencies.map(function (path) { return require(path); }));
    } else {
        factory.apply(root, dependencies.map(function (path) {
            var tokens = path.split('/');
            return root[tokens[tokens.length - 1]];
        }));
    }
}(this, function (empower, assert) {

    function generateFakeAssert () {
        return function (actual, message) {
            if (!actual) {
                throw new Error('FakeAssert: assertion failed. ' + message);
            }
        };
    }

    function fakeFormatter (context) {
        return [
            context.location.path,
            context.content
        ].join('\n');
    }

    function shouldThrowErrorIfFunctionBindDoesNotExist (arg) {
        var expectedMessage = 'empower module depends on method Function#bind that your browser does not support. Please use es5-shim.js to go on.';
        assert.throws(
            function() {
                empower(arg, fakeFormatter);
            },
            function(err) {
                return ((err instanceof Error) && (expectedMessage === err.message));
            },
            'unexpected error'
        );
    }

    suite('Under environment without Function#bind', function () {

        test('assert object', function () {
            var fakeAssertObject = {
                ok: generateFakeAssert(),
                equal: function (actual, expected, message) {
                    this.ok(actual == expected, message);
                }
            };
            shouldThrowErrorIfFunctionBindDoesNotExist(fakeAssertObject);
        });

        test('assert function', function () {
            var fakeAssertFunction = generateFakeAssert();
            fakeAssertFunction.ok = fakeAssertFunction;
            fakeAssertFunction.equal = function (actual, expected, message) {
                this.ok(actual == expected, message);
            };
            shouldThrowErrorIfFunctionBindDoesNotExist(fakeAssertFunction);
        });
    });

}));
