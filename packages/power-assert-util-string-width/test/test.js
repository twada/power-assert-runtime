delete require.cache[require.resolve('..')];
const stringWidth = require('..');
const assert = require('assert');

describe('stringWidth', () => {
  [
    ['abcde', 5],
    ['あいうえお', 10],
    ['ｱｲｳｴｵ', 5]
  ].forEach((col, idx) => {
    const input = col[0];
    const expected = col[1];
    it(idx + ': ' + input, () => {
      assert.strictEqual(stringWidth(input), expected);
    });
  });

  describe('unicode normalization', () => {
    it('composition', () => {
      const str = 'が';
      assert.strictEqual(str.length, 1);
      assert.strictEqual(stringWidth(str), 2);
    });
    it('decomposition', () => {
      const str = 'か\u3099';
      assert.strictEqual(str.length, 2);
      assert.strictEqual(stringWidth(str), 4);
    });
  });

  it('surrogate pair', () => {
    const strWithSurrogatePair = '𠮷野家で𩸽';
    assert.strictEqual(strWithSurrogatePair.length, 7);
    assert.strictEqual(stringWidth(strWithSurrogatePair), 10);
  });
});

describe('ambiguous EastAsianWidth', () => {
  let strWithAmbiguousEastAsian;
  beforeEach(() => {
    strWithAmbiguousEastAsian = '※脚注';
  });
  it('Treat ambiguous-width characters as fullwidth (= `2`) by default.', () => {
    assert.strictEqual(stringWidth(strWithAmbiguousEastAsian), 6);
  });
  it('stringWidth.narrow treats ambiguous-width characters as narrow (= `1`)', () => {
    assert.strictEqual(stringWidth.narrow(strWithAmbiguousEastAsian), 5);
  });
});
