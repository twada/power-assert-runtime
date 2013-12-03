var espower = require('espower'),
    esprima = require('esprima'),
    escodegen = require('escodegen');

function extractBodyFrom (source) {
    var tree = esprima.parse(source, {tolerant: true, loc: true, range: true});
    return tree.body[0];
}

function extractBodyOfAssertionAsCode (node) {
    var expression;
    if (node.type === 'ExpressionStatement') {
        expression = node.expression;
    }
    return escodegen.generate(expression.arguments[0], {format: {compact: true}});
}

function applyEspower (line, options) {
    options = options || {destructive: false, source: line, path: '/path/to/some_test.js', powerAssertVariableName: 'assert'};
    var tree = extractBodyFrom(line);
    return espower(tree, options);
}

function weave (line, options) {
    return escodegen.generate(applyEspower(line, options), {format: {compact: true}});
}

module.exports = {
    weave: weave,
    extractBodyOfAssertionAsCode: extractBodyOfAssertionAsCode
};
