var q = require('../test_helper').QUnit,
    formatter = require('../lib/power-assert-formatter'),
    enhance = require('../lib/empower').enhance,
    powerAssertTextLines = [],
    assert = enhance(q.assert.ok, formatter, function (context, message) {
        powerAssertTextLines = formatter.format(context);
    }),
    espower = require('espower'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    CoffeeScript = require('coffee-script-redux');


q.module('CoffeeScriptRedux integration', {
    setup: function () {
        powerAssertTextLines.length = 0;
    }
});

var espowerCoffee = function () {
    var extractBodyOfAssertionAsCode = function (node) {
        var expression;
        if (node.type === 'ExpressionStatement') {
            expression = node.expression;
        } else if (node.type === 'ReturnStatement') {
            expression = node.argument;
        }
        return escodegen.generate(expression.arguments[0], {format: {compact: true}});
    };
    return function (csCode) {
        var parseOptions = {raw: true},
            csAST = CoffeeScript.parse(csCode, parseOptions),
            compileOptions = {bare: false},
            jsAST = CoffeeScript.compile(csAST, compileOptions),
            espoweredAst = espower(jsAST, {destructive: false, source: csCode, path: '/path/to/bar_test.coffee', powerAssertVariableName: 'assert'}),
            expression = espoweredAst.body[0],
            instrumentedCode = extractBodyOfAssertionAsCode(expression);
        //tap.note(instrumentedCode);
        return instrumentedCode;
    };
}();


q.test('assert.ok dog.speak() == says', function () {
    var dog = { speak: function () { return 'woof'; } },
        says = 'meow';
    assert.ok(eval(espowerCoffee('assert.ok dog.speak() == says')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/bar_test.coffee:1',
        '',
        'assert.ok dog.speak() == says',
        '          |   |       |  |   ',
        '          |   |       |  "meow"',
        '          {}  "woof"  false  ',
        ''
    ]);
});


q.test('assert.ok dog.age is four', function () {
    var dog = { age: 3 },
        four = 4;
    assert.ok(eval(espowerCoffee('assert.ok dog.age is four')));
    q.deepEqual(powerAssertTextLines, [
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


q.test('assert.ok dog[prop].year is lastYear', function () {
    var dog = {birthday: { year: 2011 }},
        lastYear = 2012,
        prop = 'birthday';
    assert.ok(eval(espowerCoffee('assert.ok dog[prop].year is lastYear')));
    q.deepEqual(powerAssertTextLines, [
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
