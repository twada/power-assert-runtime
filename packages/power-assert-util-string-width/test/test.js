delete require.cache[require.resolve('..')];
var stringWidth = require('..');
var assert = require('assert');

describe('stringWidth', function () {
    [
        ['abcde',  5],
        ['あいうえお',  10],
        ['ｱｲｳｴｵ',       5]
    ].forEach(function(col, idx) {
        var input = col[0], expected = col[1];
        it(idx + ': ' + input, function () {
            assert.equal(stringWidth(input), expected);
        });
    });

    describe('unicode normalization', function () {
        it('composition', function () {
            var str = 'が';
            assert.equal(str.length, 1);
            assert.equal(stringWidth(str), 2);
        });
        it('decomposition', function () {
            var str = 'か\u3099';
            assert.equal(str.length, 2);
            assert.equal(stringWidth(str), 4);
        });
    });

    it('surrogate pair', function () {
        var strWithSurrogatePair = "𠮷野家で𩸽";
        assert.equal(strWithSurrogatePair.length, 7);
        assert.equal(stringWidth(strWithSurrogatePair), 10);
    });
});

describe('ambiguous EastAsianWidth', function () {
    beforeEach(function () {
        this.strWithAmbiguousEastAsian = '※脚注';
    });
    it('Treat ambiguous-width characters as fullwidth (= `2`) by default.', function () {
        assert.equal(stringWidth(this.strWithAmbiguousEastAsian), 6);
    });
    it('stringWidth.narrow treats ambiguous-width characters as narrow (= `1`)', function () {
        assert.equal(stringWidth.narrow(this.strWithAmbiguousEastAsian), 5);
    });
});
