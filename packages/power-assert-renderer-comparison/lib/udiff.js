'use strict';

const DiffMatchPatch = require('diff-match-patch');
const dmp = new DiffMatchPatch();
const shouldUseLineLevelDiff = (text, config) => config.lineDiffThreshold < text.split(/\r\n|\r|\n/).length;

function udiff (config) {
  return function diff (text1, text2) {
    if (config && shouldUseLineLevelDiff(text1, config)) {
      return decodeURIComponent(udiffLines(text1, text2));
    } else {
      return decodeURIComponent(udiffChars(text1, text2));
    }
  };
}

function udiffLines (text1, text2) {
  /* jshint camelcase: false */
  const a = dmp.diff_linesToChars_(text1, text2);
  const diffs = dmp.diff_main(a.chars1, a.chars2, false);
  dmp.diff_charsToLines_(diffs, a.lineArray);
  dmp.diff_cleanupSemantic(diffs);
  return dmp.patch_toText(dmp.patch_make(text1, diffs));
}

function udiffChars (text1, text2) {
  /* jshint camelcase: false */
  const diffs = dmp.diff_main(text1, text2, false);
  dmp.diff_cleanupSemantic(diffs);
  return dmp.patch_toText(dmp.patch_make(text1, diffs));
}

module.exports = udiff;
