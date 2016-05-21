'use strict';

var parser = require('acorn');
require('acorn-es7-plugin')(parser);
var estraverse = require('estraverse');
var purifyAst = require('espurify').customize({extra: ['range']});
var assign = require('object-assign');

module.exports = function (powerAssertContext) {
    var source = powerAssertContext.source;
    var astAndTokens = parse(source);
    var newSource = assign({}, source, {
        ast: JSON.stringify(purifyAst(astAndTokens.expression)),
        tokens: JSON.stringify(astAndTokens.tokens),
        visitorKeys: JSON.stringify(estraverse.VisitorKeys)
    });
    return assign({}, powerAssertContext, { source: newSource });
};

function parserOptions(tokens) {
    return {
        sourceType: 'module',
        ecmaVersion: 7,
        locations: true,
        ranges: false,
        onToken: tokens,
        plugins: {asyncawait: true}
    };
}

function parse (source) {
    var code = source.content;
    var ast, tokens;

    function doParse(wrapper) {
        var content = wrapper ? wrapper(code) : code;
        var tokenBag = [];
        ast = parser.parse(content, parserOptions(tokenBag));
        if (wrapper) {
            ast = ast.body[0].body;
            tokens = tokenBag.slice(6, -2);
        } else {
            tokens = tokenBag.slice(0, -1);
        }
    }

    if (source.async) {
        doParse(wrappedInAsync);
    } else if (source.generator) {
        doParse(wrappedInGenerator);
    } else {
        doParse();
    }

    var exp = ast.body[0].expression;
    var columnOffset = exp.loc.start.column;
    var offsetTree = estraverse.replace(exp, {
        keys: estraverse.VisitorKeys,
        enter: function (eachNode) {
            eachNode.range = [
                eachNode.loc.start.column - columnOffset,
                eachNode.loc.end.column - columnOffset
            ];
            delete eachNode.loc;
            return eachNode;
        }
    });

    return {
        tokens: offsetAndSlimDownTokens(tokens),
        expression: offsetTree
    };
}

function wrappedInGenerator (jsCode) {
    return 'function *wrapper() { ' + jsCode + ' }';
}

function wrappedInAsync (jsCode) {
    return 'async function wrapper() { ' + jsCode + ' }';
}

function offsetAndSlimDownTokens (tokens) {
    var i, token, result = [];
    var columnOffset;
    for(i = 0; i < tokens.length; i += 1) {
        token = tokens[i];
        if (i === 0) {
            columnOffset = token.loc.start.column;
        }
        result.push({
            type: {
                label: token.type.label
            },
            value: token.value,
            range: [
                token.loc.start.column - columnOffset,
                token.loc.end.column - columnOffset
            ]
        });
    }
    return result;
}
