'use strict';

const babel = require('@babel/core');

module.exports = function transpile (code, embedAst) {
  embedAst = (embedAst !== undefined) ? embedAst : true;
  return babel.transform(code, {
    filename: '/absolute/path/to/project/test/some_test.js',
    presets: [
      ['@babel/preset-env', {
        targets: {
          node: 'current',
          browsers: [
            '>0.25%',
            'not ie 11',
            'not op_mini all'
          ]
        }
      }],
      '@babel/preset-react'
    ],
    plugins: [
      '@babel/plugin-proposal-function-bind',
      ['babel-plugin-espower', {
        embedAst: embedAst
      }]
    ]
  }).code;
};
