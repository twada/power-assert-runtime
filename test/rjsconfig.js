var require = {
    paths: {
        assert: "../bower_components/assert/assert",
        "es5-shim": "../bower_components/es5-shim/es5-shim",
        escodegen: '../bower_components/escodegen/escodegen.browser',
        esprima: "../bower_components/esprima/esprima",
        estraverse: "../bower_components/estraverse/estraverse",
        espower: "../bower_components/espower/lib/espower",
        mocha: "../bower_components/mocha/mocha",
        requirejs: "../bower_components/requirejs/require"
    },
    shim: {
        assert: {
            exports: "assert"
        },
        escodegen: {
            exports: 'escodegen'
        }
    }
};
