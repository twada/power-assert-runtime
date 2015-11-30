var require = {
    paths: {
        "empower-core": "../local_build/empower-core",
        acorn: '../node_modules/acorn/dist/acorn',
        escodegen: '../local_build/escodegen',
        espower: "../node_modules/espower/build/espower",
        assert: '../local_build/assert',
        babel: '../node_modules/babel-core/browser',
        bluebird: '../node_modules/bluebird/js/browser/bluebird',
        "acorn-es7-plugin": '../local_build/acorn-es7-plugin',
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
