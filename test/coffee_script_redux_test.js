var empower = require('../lib/empower'),
    espower = require('espower'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    baseAssert = require('assert'),
    assert = empower(baseAssert),
    CoffeeScript = require('coffee-script-redux'),
    extractBodyOfAssertionAsCode = require('../test_helper').extractBodyOfAssertionAsCode,
    espowerCoffee = function () {
        return function (csCode) {
            var parseOptions = {raw: true},
                csAST = CoffeeScript.parse(csCode, parseOptions),
                compileOptions = {bare: false},
                jsAST = CoffeeScript.compile(csAST, compileOptions),
                espoweredAst = espower(jsAST, {destructive: false, source: csCode, path: '/path/to/bar_test.coffee', powerAssertVariableName: 'assert'}),
                expression = espoweredAst.body[0],
                instrumentedCode = extractBodyOfAssertionAsCode(expression);
            return instrumentedCode;
        };
    }();

var expectPowerAssertMessage = function (body, expectedLines) {
    try {
        body();
        baseAssert.fail('AssertionError should be thrown');
    } catch (e) {
        baseAssert.equal(e.message, expectedLines.join('\n'));
    }
};


suite('CoffeeScriptRedux integration', function () {

    test('assert.ok dog.speak() == says', function () {
        var dog = { speak: function () { return 'woof'; } },
            says = 'meow';
        expectPowerAssertMessage(function () {
            assert.ok(eval(espowerCoffee('assert.ok dog.speak() == says')));
        }, [
            '# /path/to/bar_test.coffee:1',
            '',
            'assert.ok dog.speak() == says',
            '          |   |       |  |   ',
            '          |   |       |  "meow"',
            '          {}  "woof"  false  ',
            ''
        ]);
    });

    test('assert.ok dog.age is four', function () {
        var dog = { age: 3 },
            four = 4;
        expectPowerAssertMessage(function () {
            assert.ok(eval(espowerCoffee('assert.ok dog.age is four')));
        }, [
            '# /path/to/bar_test.coffee:1',
            '',
            'assert.ok dog.age is four',
            '          |   |   |  |   ',
            '          |   |   |  4   ',
            '          |   3   false  ',
            '          {"age":3}      ',
            ''
        ]);
    });

    test('assert.ok dog[prop].year is lastYear', function () {
        var dog = {birthday: { year: 2011 }},
            lastYear = 2012,
            prop = 'birthday';
        expectPowerAssertMessage(function () {
            assert.ok(eval(espowerCoffee('assert.ok dog[prop].year is lastYear')));
        }, [
            '# /path/to/bar_test.coffee:1',
            '',
            'assert.ok dog[prop].year is lastYear',
            '          |  ||     |    |  |       ',
            '          |  ||     |    |  2012    ',
            '          |  ||     2011 false      ',
            '          |  |"birthday"            ',
            '          |  {"year":2011}          ',
            '          {"birthday":{"year":2011}}',
            ''
        ]);
    });
});
