var require = {
    paths: {
        empower: "../build/empower",
        acorn: '../node_modules/acorn/dist/acorn',
        escodegen: '../bower_components/escodegen/escodegen.browser',
        espower: "../node_modules/espower/build/espower",
        assert: "../bower_components/assert/assert",
        mocha: "../bower_components/mocha/mocha",
        requirejs: "../bower_components/requirejs/require",
        "buster-assertions": "../bower_components/buster.js/buster-test"
    },
    shim: {
        assert: {
            exports: "assert"
        },
        "buster-assertions": {
            exports: "buster"
        }
    }
};
