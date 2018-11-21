'use strict';

var babel = require('@babel/core');
var createEspowerPlugin = require('babel-plugin-espower/create');

module.exports = function transpile (code, embedAst) {
    embedAst = (embedAst !== undefined) ? embedAst : true;
    return babel.transform(code, {
        filename: '/absolute/path/to/project/test/some_test.js',
        presets: [
            ['@babel/preset-env', {
                targets: {
                    node: "current",
                    browsers: [
                        ">0.25%",
                        "not ie 11",
                        "not op_mini all"
                    ]
                }
            }],
            require("@babel/preset-react")
        ],
        plugins: [
            require("@babel/plugin-proposal-function-bind"),
            createEspowerPlugin(babel, {
                embedAst: embedAst,
                sourceRoot: '/absolute/path/to/project'
            })
        ]
    }).code;
};
