'use strict';

var babel = require('babel-core');
var createEspowerPlugin = require('babel-plugin-espower/create');

module.exports = function transpile (code, embedAst) {
    embedAst = (embedAst !== undefined) ? embedAst : true;
    return babel.transform(code, {
        filename: '/absolute/path/to/project/test/some_test.js',
        plugins: [
            createEspowerPlugin(babel, {
                embedAst: embedAst,
                sourceRoot: '/absolute/path/to/project'
            })
        ]
    }).code;
};
