'use strict';

const BaseRenderer = require('power-assert-renderer-base');
const parser = require('acorn');
const estraverse = require('estraverse');
const purifyAst = require('espurify').customize({ extra: ['range'] });

class AstReducer extends BaseRenderer {
  onStart (powerAssertContext) {
    const source = powerAssertContext.source;
    if (source.ast && source.tokens && source.visitorKeys) {
      parseIfJson(source, 'ast');
      parseIfJson(source, 'tokens');
      parseIfJson(source, 'visitorKeys');
      return;
    }
    let astAndTokens;
    try {
      astAndTokens = parse(source);
    } catch (e) {
      source.error = e;
      return;
    }
    Object.assign(source, {
      ast: purifyAst(astAndTokens.expression),
      tokens: astAndTokens.tokens,
      visitorKeys: estraverse.VisitorKeys
    });
  }
}

function parseIfJson (source, propName) {
  if (typeof source[propName] === 'string') {
    source[propName] = JSON.parse(source[propName]);
  }
}

function parserOptions (tokens) {
  return {
    sourceType: 'module',
    ecmaVersion: 2018,
    locations: true,
    ranges: false,
    onToken: tokens
  };
}

function parse (source) {
  const code = source.content;
  let ast, tokens;

  function doParse (wrapper) {
    const content = wrapper ? wrapper(code) : code;
    const tokenBag = [];
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

  const exp = ast.body[0].expression;
  const columnOffset = exp.loc.start.column;
  const offsetTree = estraverse.replace(exp, {
    keys: estraverse.VisitorKeys,
    enter: function (eachNode) {
      if (!eachNode.loc && eachNode.range) {
        // skip already visited node
        return eachNode;
      }
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

const wrappedInGenerator = (jsCode) => `function *wrapper() { ${jsCode} }`;
const wrappedInAsync = (jsCode) => `async function wrapper() { ${jsCode} }`;

function offsetAndSlimDownTokens (tokens) {
  let result = [];
  let columnOffset;
  tokens.forEach((token, i) => {
    if (i === 0) {
      columnOffset = token.loc.start.column;
    }
    const newToken = {
      type: {
        label: token.type.label
      },
      range: [
        token.loc.start.column - columnOffset,
        token.loc.end.column - columnOffset
      ]
    };
    if (typeof token.value !== 'undefined') {
      newToken.value = token.value;
    }
    result.push(newToken);
  });
  return result;
}

module.exports = AstReducer;
