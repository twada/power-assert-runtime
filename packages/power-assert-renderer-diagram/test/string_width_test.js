delete require.cache[require.resolve('../lib/string-width')];
var stringWidth = require('../lib/string-width');
var assert = require('assert');

describe('string-width', function () {
    var widthOf = stringWidth();
    [
        ['abcde',  5],
        ['あいうえお',  10],
        ['ｱｲｳｴｵ',       5]
    ].forEach(function(col, idx) {
        var input = col[0], expected = col[1];
        it(idx + ': ' + input, function () {
            assert.equal(widthOf(input), expected);
        });
    });

    describe('unicode normalization', function () {
        it('composition', function () {
            var str = 'が';
            assert.equal(str.length, 1);
            assert.equal(widthOf(str), 2);
        });
        it('decomposition', function () {
            var str = 'か\u3099';
            assert.equal(str.length, 2);
            assert.equal(widthOf(str), 4);
        });
    });

    it('surrogate pair', function () {
        var strWithSurrogatePair = "𠮷野家で𩸽";
        assert.equal(strWithSurrogatePair.length, 7);
        assert.equal(widthOf(strWithSurrogatePair), 10);
    });
});

describe('ambiguous EastAsianWidth', function () {
    beforeEach(function () {
        this.strWithAmbiguousEastAsian = '※ただしイケメンに限る';
    });
    it('when set to 1', function () {
        var widthOf = stringWidth({
            ambiguousEastAsianCharWidth: 1
        });
        assert.equal(widthOf(this.strWithAmbiguousEastAsian), 21);
    });
    it('when set to 2', function () {
        var widthOf = stringWidth({
            ambiguousEastAsianCharWidth: 2
        });
        assert.equal(widthOf(this.strWithAmbiguousEastAsian), 22);
    });
});
