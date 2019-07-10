'use strict';

delete require.cache[require.resolve('..')];
const FileRenderer = require('..');
const AstReducer = require('power-assert-context-reducer-ast');
const assert = require('../../../test_helper/empowered-assert');
const transpile = require('../../../test_helper/transpile');
const testRendering = require('../../../test_helper/test-rendering');

describe('FileRenderer', function () {
  it('assert(foo === bar)', function () {
    const foo = 'foo';
    const bar = 'bar';
    testRendering(function () {
      eval(transpile('assert(foo === bar)'));
    }, [
      '# test/some_test.js:1'
    ], { pipeline: [AstReducer, FileRenderer] });
  });

  it('line number detection', function () {
    const falsyStr = '';
    testRendering(function () {
      eval(transpile('const i = 0;\n\nassert(falsyStr)'));
    }, [
      '# test/some_test.js:3'
    ], { pipeline: [AstReducer, FileRenderer] });
  });
});
