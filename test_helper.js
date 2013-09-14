var espower = require('espower'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    instrument;

function extractBodyFrom (source) {
    var tree = esprima.parse(source, {tolerant: true, loc: true, range: true});
    return tree.body[0];
}

function extractBodyOfAssertionAsCode (node) {
    var expression;
    if (node.type === 'ExpressionStatement') {
        expression = node.expression;
    } else if (node.type === 'ReturnStatement') {
        expression = node.argument;
    }
    return escodegen.generate(expression.arguments[0], {format: {compact: true}});
}

instrument = function () {
    return function (line, options) {
        options = options || {destructive: false, source: line, path: '/path/to/some_test.js', powerAssertVariableName: 'assert'};
        var tree = extractBodyFrom(line),
            result = espower(tree, options),
            instrumentedCode = extractBodyOfAssertionAsCode(result);
        return instrumentedCode;
    };
}();

module.exports = {
    instrument: instrument,
    extractBodyOfAssertionAsCode: extractBodyOfAssertionAsCode
};
