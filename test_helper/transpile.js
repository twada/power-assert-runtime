'use strict';

var babel = require('babel-core');
var createEspowerPlugin = require('babel-plugin-espower/create');

module.exports = function transpile (code) {
    return babel.transform(code, {
        filename: '/absolute/path/to/project/test/some_test.js',
        plugins: [
            createEspowerPlugin(babel, {
                sourceRoot: '/absolute/path/to/project'
            })
        ]
    }).code;
};
