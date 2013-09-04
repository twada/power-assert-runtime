var q = require('../test_helper').QUnit,
    instrument = require('../test_helper').instrument,
    formatter = require('../lib/power-assert-formatter'),
    enhance = require('../lib/empower').enhance,
    powerAssertTextLines = [],
    assert = enhance(q.assert.ok, formatter, function (context, message) {
        powerAssertTextLines = formatter.format(context);
    });

q.module('power-assert-formatter', {
    setup: function () {
        powerAssertTextLines.length = 0;
    }
});

q.test('Identifier with empty string', function () {
    var falsyStr = '';
    assert.ok(eval(instrument('assert(falsyStr);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(falsyStr);',
        '       |         ',
        '       ""        ',
        ''
    ]);
});


q.test('ReturnStatement', function () {
    var falsyStr = '';
    assert.ok(eval(instrument('return assert(falsyStr);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'return assert(falsyStr);',
        '              |         ',
        '              ""        ',
        ''
    ]);
});


q.test('Identifier with falsy number', function () {
    var falsyNum = 0;
    assert.ok(eval(instrument('assert(falsyNum);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(falsyNum);',
        '       |         ',
        '       0         ',
        ''
    ]);
});


q.test('UnaryExpression, negation', function () {
    var truth = true;
    assert.ok(eval(instrument('assert(!truth);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(!truth);',
        '       ||      ',
        '       |true   ',
        '       false   ',
        ''
    ]);
});


q.test('UnaryExpression, double negative', function () {
    var some = '';
    assert.ok(eval(instrument('assert(!!some);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(!!some);',
        '       |||     ',
        '       ||""    ',
        '       |true   ',
        '       false   ',
        ''
    ]);
});


q.test('typeof operator: assert(typeof foo !== "undefined");', function () {
    assert.ok(eval(instrument('assert(typeof foo !== "undefined");')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(typeof foo !== "undefined");',
        '       |          |                ',
        '       |          false            ',
        '       "undefined"                 ',
        ''
    ]);
});

q.test('undefined property: assert({}.hoge === "xxx");', function () {
    assert.ok(eval(instrument('assert({}.hoge === "xxx");')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert({}.hoge === "xxx");',
        '          |    |          ',
        '          |    false      ',
        '          undefined       ',
        ''
    ]);
});


q.test('assert((delete foo.bar) === false);', function () {
    var foo = {
        bar: {
            baz: false
        }
    };
    assert.ok(eval(instrument('assert((delete foo.bar) === false);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert((delete foo.bar) === false);',
        '        |      |   |    |          ',
        '        |      |   |    false      ',
        '        |      |   {"baz":false}   ',
        '        true   {"bar":{"baz":false}}',
        ''
    ]);
});


q.test('assert((delete foo) === false);', function () {
    var foo = {
        bar: {
            baz: false
        }
    };
    assert.ok(eval(instrument('assert((delete foo) === false);')));
    q.deepEqual(powerAssertTextLines, [
    ]);
});


q.test('assert(fuga === piyo);', function () {
    var fuga = 'foo',
        piyo = 8;
    assert.ok(eval(instrument('assert(fuga === piyo);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(fuga === piyo);',
        '       |    |   |     ',
        '       |    |   8     ',
        '       |    false     ',
        '       "foo"          ',
        ''
    ]);
});


q.test('assert(fuga !== piyo);', function () {
    var fuga = 'foo',
        piyo = 'foo';
    assert.ok(eval(instrument('assert(fuga !== piyo);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(fuga !== piyo);',
        '       |    |   |     ',
        '       |    |   "foo" ',
        '       |    false     ',
        '       "foo"          ',
        ''
    ]);
});


q.test('BinaryExpression with Literal and Identifier: assert(fuga !== 4);', function () {
    var fuga = 4;
    assert.ok(eval(instrument('assert(fuga !== 4);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(fuga !== 4);',
        '       |    |      ',
        '       4    false  ',
        ''
    ]);
});


q.test('assert(4 !== 4);', function () {
    assert.ok(eval(instrument('assert(4 !== 4);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(4 !== 4);',
        '         |      ',
        '         false  ',
        ''
    ]);
});


q.test('MemberExpression: assert(ary1.length === ary2.length);', function () {
    var ary1 = ['foo', 'bar'];
    var ary2 = ['aaa', 'bbb', 'ccc'];
    assert.ok(eval(instrument('assert(ary1.length === ary2.length);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(ary1.length === ary2.length);',
        '       |    |      |   |    |       ',
        '       |    |      |   |    3       ',
        '       |    |      |   ["aaa","bbb","ccc"]',
        '       |    2      false            ',
        '       ["foo","bar"]                ',
        ''
    ]);
});


q.test('LogicalExpression: assert(5 < actual && actual < 13);', function () {
    var actual = 16;
    assert.ok(eval(instrument('assert(5 < actual && actual < 13);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(5 < actual && actual < 13);',
        '         | |      |  |      |     ',
        '         | |      |  16     false ',
        '         | 16     false           ',
        '         true                     ',
        ''
    ]);
});


q.test('LogicalExpression OR: assert.ok(actual < 5 || 13 < actual);', function () {
    var actual = 10;
    assert.ok(eval(instrument('assert.ok(actual < 5 || 13 < actual);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert.ok(actual < 5 || 13 < actual);',
        '          |      |   |     | |       ',
        '          |      |   |     | 10      ',
        '          |      |   false false     ',
        '          10     false               ',
        ''
    ]);
});


q.test('Characterization test of LogicalExpression current spec: assert(2 > actual && actual < 13);', function () {
    var actual = 5;
    assert.ok(eval(instrument('assert(2 > actual && actual < 13);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(2 > actual && actual < 13);',
        '         | |      |               ',
        '         | 5      false           ',
        '         false                    ',
        ''
    ]);
});


q.test('Deep MemberExpression chain: assert(foo.bar.baz);', function () {
    var foo = {
        bar: {
            baz: false
        }
    };
    assert.ok(eval(instrument('assert(foo.bar.baz);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(foo.bar.baz);',
        '       |   |   |    ',
        '       |   |   false',
        '       |   {"baz":false}',
        '       {"bar":{"baz":false}}',
        ''
    ]);
});


q.test('computed MemberExpression with Literal key: assert(foo["bar"].baz);', function () {
    var foo = {
        bar: {
            baz: false
        }
    };
    assert.ok(eval(instrument('assert(foo["bar"].baz);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(foo["bar"].baz);',
        '       |  |       |    ',
        '       |  |       false',
        '       |  {"baz":false}',
        '       {"bar":{"baz":false}}',
        ''
    ]);
});


q.test('computed MemberExpression with Identifier key: assert(foo[propName].baz);', function () {
    var propName = 'bar',
        foo = {
            bar: {
                baz: false
            }
        };
    assert.ok(eval(instrument('assert(foo[propName].baz);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(foo[propName].baz);',
        '       |  ||         |    ',
        '       |  |"bar"     false',
        '       |  {"baz":false}   ',
        '       {"bar":{"baz":false}}',
        ''
    ]);
});


q.test('computed MemberExpression chain with various key: assert(foo[propName]["baz"][keys()[0]]);', function () {
    var keys = function () { return ["toto"]; },
        propName = "bar",
        foo = {
            bar: {
                baz: {
                    toto: false
                }
            }
        };
    assert.ok(eval(instrument('assert(foo[propName]["baz"][keys()[0]]);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(foo[propName]["baz"][keys()[0]]);',
        '       |  ||        |      ||     |     ',
        '       |  ||        |      ||     "toto"',
        '       |  ||        |      |["toto"]    ',
        '       |  ||        |      false        ',
        '       |  |"bar"    {"toto":false}      ',
        '       |  {"baz":{"toto":false}}        ',
        '       {"bar":{"baz":{"toto":false}}}   ',
        ''
    ]);
});


q.test('assert(func());', function () {
    var func = function () { return false; };
    assert.ok(eval(instrument('assert(func());')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(func());',
        '       |       ',
        '       false   ',
        ''
    ]);
});


q.test('assert(obj.age());', function () {
    var obj = {
        age: function () {
            return 0;
        }
    };
    assert.ok(eval(instrument('assert(obj.age());')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(obj.age());',
        '       |   |      ',
        '       {}  0      ',
        ''
    ]);
});


q.test('CallExpression with arguments: assert(isFalsy(positiveInt));', function () {
    var isFalsy = function (arg) {
        return !(arg);
    };
    var positiveInt = 50;
    assert.ok(eval(instrument('assert(isFalsy(positiveInt));')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(isFalsy(positiveInt));',
        '       |       |             ',
        '       false   50            ',
        ''
    ]);
});


q.test('assert(sum(one, two, three) === seven);', function () {
    var sum = function () {
        var result = 0;
        for (var i = 0; i < arguments.length; i += 1) {
            result += arguments[i];
        }
        return result;
    };
    var one = 1, two = 2, three = 3, seven = 7, ten = 10;
    assert.ok(eval(instrument('assert(sum(one, two, three) === seven);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(sum(one, two, three) === seven);',
        '       |   |    |    |      |   |      ',
        '       |   |    |    |      |   7      ',
        '       6   1    2    3      false      ',
        ''
    ]);
});


q.test('CallExpression with CallExpressions as arguments: assert(sum(sum(one, two), three) === sum(sum(two, three), seven));', function () {
    var sum = function () {
        var result = 0;
        for (var i = 0; i < arguments.length; i += 1) {
            result += arguments[i];
        }
        return result;
    };
    var one = 1, two = 2, three = 3, seven = 7, ten = 10;
    assert.ok(eval(instrument('assert(sum(sum(one, two), three) === sum(sum(two, three), seven));')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(sum(sum(one, two), three) === sum(sum(two, three), seven));',
        '       |   |   |    |     |      |   |   |   |    |       |       ',
        '       |   |   |    |     |      |   12  5   2    3       7       ',
        '       6   3   1    2     3      false                            ',
        ''
    ]);
});


q.test('assert(math.calc.sum(one, two, three) === seven);', function () {
    var math = {
        calc: {
            sum: function () {
                var result = 0;
                for (var i = 0; i < arguments.length; i += 1) {
                    result += arguments[i];
                }
                return result;
            }
        }
    };
    var one = 1, two = 2, three = 3, seven = 7, ten = 10;
    assert.ok(eval(instrument('assert(math.calc.sum(one, two, three) === seven);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(math.calc.sum(one, two, three) === seven);',
        '       |    |    |   |    |    |      |   |      ',
        '       |    |    |   |    |    |      |   7      ',
        '       |    {}   6   1    2    3      false      ',
        '       {"calc":{}}                               ',
        ''
    ]);
});


q.test('Nested CallExpression with BinaryExpression: assert((three * (seven * ten)) === three);', function () {
    var one = 1, two = 2, three = 3, seven = 7, ten = 10;
    assert.ok(eval(instrument('assert((three * (seven * ten)) === three);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert((three * (seven * ten)) === three);',
        '        |     |  |     | |     |   |      ',
        '        |     |  |     | |     |   3      ',
        '        |     |  |     | 10    false      ',
        '        |     |  7     70                 ',
        '        3     210                         ',
        ''
    ]);
});


q.test('Simple BinaryExpression with comment', function () {
    var hoge = 'foo';
    var fuga = 'bar';
    assert.ok(eval(instrument('assert.ok(hoge === fuga, "comment");')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert.ok(hoge === fuga, "comment");',
        '          |    |   |                ',
        '          |    |   "bar"            ',
        '          |    false                ',
        '          "foo"                     ',
        ''
    ]);
});


q.test('Looooong string', function () {
    var longString = 'very very loooooooooooooooooooooooooooooooooooooooooooooooooooong message';
    var anotherLongString = 'yet another loooooooooooooooooooooooooooooooooooooooooooooooooooong message';
    assert.ok(eval(instrument('assert(longString === anotherLongString);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(longString === anotherLongString);',
        '       |          |   |                  ',
        '       |          |   "yet another loooooooooooooooooooooooooooooooooooooooooooooooooooong message"',
        '       |          false                  ',
        '       "very very loooooooooooooooooooooooooooooooooooooooooooooooooooong message"',
        ''
    ]);
});


q.test('double byte character width', function () {
    var fuga = 'あい',
        piyo = 'うえお';
    var concat = function (a, b) {
        return a + b;
    };
    assert.ok(eval(instrument('assert(!concat(fuga, piyo));')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(!concat(fuga, piyo));',
        '       ||      |     |      ',
        '       ||      |     "うえお"',
        '       ||      "あい"       ',
        '       |"あいうえお"        ',
        '       false                ',
        ''
    ]);

});


q.test('Japanese hankaku width', function () {
    var fuga = 'ｱｲ',
        piyo = 'ｳｴｵ';
    var concat = function (a, b) {
        return a + b;
    };
    assert.ok(eval(instrument('assert(!concat(fuga, piyo));')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(!concat(fuga, piyo));',
        '       ||      |     |      ',
        '       ||      "ｱｲ"  "ｳｴｵ"  ',
        '       |"ｱｲｳｴｵ"             ',
        '       false                ',
        ''
    ]);

});



q.test('Object having circular structure', function () {
    var cyclic = [], two = 2;
    cyclic.push('foo');
    cyclic.push(cyclic);
    cyclic.push('baz');
    assert.ok(eval(instrument('assert.ok(cyclic[two] === cyclic);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert.ok(cyclic[two] === cyclic);',
        '          |     ||    |   |       ',
        '          |     ||    |   ["foo","#Circular#","baz"]',
        '          |     |2    false       ',
        '          |     "baz"             ',
        '          ["foo","#Circular#","baz"]',
        ''
    ]);
});



q.test('UnaryExpression of UnaryExpression: assert(typeof + twoStr === -twoStr);', function () {
    var twoStr = '2';
    assert.ok(eval(instrument('assert(typeof + twoStr === -twoStr);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(typeof + twoStr === -twoStr);',
        '       |      | |      |   ||       ',
        '       |      | |      |   |"2"     ',
        '       |      | |      |   -2       ',
        '       |      2 "2"    false        ',
        '       "number"                     ',
        ''
    ]);
});



q.test('AssignmentExpression: assert(minusOne += 1);', function () {
    var minusOne = -1;
    assert.ok(eval(instrument('assert(minusOne += 1);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(minusOne += 1);',
        '                |     ',
        '                0     ',
        ''
    ]);
});



q.test('AssignmentExpression with MemberExpression: assert((dog.age += 1) === four);', function () {
    var dog = { age: 2 }, four = 4;
    assert.ok(eval(instrument('assert((dog.age += 1) === four);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert((dog.age += 1) === four);',
        '                |     |   |     ',
        '                |     |   4     ',
        '                3     false     ',
        ''
    ]);
});



q.test('ArrayExpression: assert([foo, bar].length === four);', function () {
    var foo = 'hoge', bar = 'fuga', four = 4;
    assert.ok(eval(instrument('assert([foo, bar].length === four);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert([foo, bar].length === four);',
        '        |    |    |      |   |     ',
        '        |    |    |      |   4     ',
        '        |    |    2      false     ',
        '        |    "fuga"                ',
        '        "hoge"                     ',
        ''
    ]);
});



q.test('various expressions in ArrayExpression: assert(typeof [[foo.bar, baz(moo)], + fourStr] === "number");', function () {
    var foo = {bar: 'fuga'}, baz = function (arg) { return null; }, moo = 'boo', fourStr = '4';
    assert.ok(eval(instrument('assert(typeof [[foo.bar, baz(moo)], + fourStr] === "number");')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(typeof [[foo.bar, baz(moo)], + fourStr] === "number");',
        '       |        |   |    |   |      | |        |             ',
        '       |        |   |    |   "boo"  4 "4"      false         ',
        '       |        |   |    null                                ',
        '       |        |   "fuga"                                   ',
        '       "object" {"bar":"fuga"}                               ',
        ''
    ]);
});



q.test('prefix UpdateExpression: assert(++minusOne);', function () {
    var minusOne = -1;
    assert.ok(eval(instrument('assert(++minusOne);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(++minusOne);',
        '       |           ',
        '       0           ',
        ''
    ]);
});



q.test('suffix UpdateExpression: assert(zero--);', function () {
    var zero = 0;
    assert.ok(eval(instrument('assert(zero--);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(zero--);',
        '       |       ',
        '       0       ',
        ''
    ]);
});



q.test('ConditionalExpression: assert(truthy ? falsy : anotherFalsy);', function () {
    var truthy = 'truthy', falsy = 0, anotherFalsy = null;
    assert.ok(eval(instrument('assert(truthy ? falsy : anotherFalsy);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(truthy ? falsy : anotherFalsy);',
        '       |        |                     ',
        '       "truthy" 0                     ',
        ''
    ]);
});


q.test('ConditionalExpression of ConditionalExpression: assert(falsy ? truthy : truthy ? anotherFalsy : truthy);', function () {
    var truthy = 'truthy', falsy = 0, anotherFalsy = null;
    assert.ok(eval(instrument('assert(falsy ? truthy : truthy ? anotherFalsy : truthy);')));
    q.deepEqual(powerAssertTextLines, [
        '# /path/to/some_test.js:1',
        '',
        'assert(falsy ? truthy : truthy ? anotherFalsy : truthy);',
        '       |                |        |                      ',
        '       0                "truthy" null                   ',
        ''
    ]);
});
