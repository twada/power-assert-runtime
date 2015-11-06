var require = {
    paths: {
        empower: "../build/empower",
        acorn: '../node_modules/acorn/dist/acorn',
        escodegen: '../build/escodegen',
        espower: "../node_modules/espower/build/espower",
        assert: '../build/assert',
        babel: '../node_modules/babel-core/browser',
        bluebird: '../node_modules/bluebird/js/browser/bluebird',
        "acorn-es7-plugin": '../build/acorn-es7-plugin',
        mocha: "../bower_components/mocha/mocha",
        requirejs: "../bower_components/requirejs/require",
        "buster-assertions": "../bower_components/buster.js/buster-test"
    },
    shim: {
        "buster-assertions": {
            exports: "buster"
        }
    }
};
