'use strict';

delete require.cache[require.resolve('..')];
const AstReducer = require('..');
const estraverse = require('estraverse');
const assert = require('assert');

describe('AstReducer', () => {
  it('add `ast`, `tokens` and `visitorKeys` to powerAssertContext', () => {
    const context = {
      source: {
        content: 'assert(foo === bar)',
        filepath: 'test/some_test.js',
        line: 1
      },
      args: [
        {
          value: false,
          events: [
            {
              value: 'FOO',
              espath: 'arguments/0/left'
            },
            {
              value: 'BAR',
              espath: 'arguments/0/right'
            },
            {
              value: false,
              espath: 'arguments/0'
            }
          ]
        }
      ]
    };

    const reducer = new AstReducer();
    reducer.onStart(context);

    assert.deepStrictEqual(context.source, {
      content: 'assert(foo === bar)',
      filepath: 'test/some_test.js',
      line: 1,
      ast: JSON.parse('{"type":"CallExpression","callee":{"type":"Identifier","name":"assert","range":[0,6]},"arguments":[{"type":"BinaryExpression","operator":"===","left":{"type":"Identifier","name":"foo","range":[7,10]},"right":{"type":"Identifier","name":"bar","range":[15,18]},"range":[7,18]}],"range":[0,19]}'),
      tokens: JSON.parse('[{"type":{"label":"name"},"value":"assert","range":[0,6]},{"type":{"label":"("},"range":[6,7]},{"type":{"label":"name"},"value":"foo","range":[7,10]},{"type":{"label":"==/!=/===/!=="},"value":"===","range":[11,14]},{"type":{"label":"name"},"value":"bar","range":[15,18]},{"type":{"label":")"},"range":[18,19]}]'),
      visitorKeys: estraverse.VisitorKeys
    });
  });

  it('parse embedded JSON if exists', () => {
    const alreadyParsed = {
      source: {
        content: 'assert(foo === bar)',
        filepath: 'test/some_test.js',
        line: 1,
        ast: '{"type":"CallExpression","callee":{"type":"Identifier","name":"assert","range":[0,6]},"arguments":[{"type":"BinaryExpression","operator":"===","left":{"type":"Identifier","name":"foo","range":[7,10]},"right":{"type":"Identifier","name":"bar","range":[15,18]},"range":[7,18]}],"range":[0,19]}',
        tokens: '[{"type":{"label":"name"},"value":"assert","range":[0,6]},{"type":{"label":"("},"range":[6,7]},{"type":{"label":"name"},"value":"foo","range":[7,10]},{"type":{"label":"==/!=/===/!=="},"value":"===","range":[11,14]},{"type":{"label":"name"},"value":"bar","range":[15,18]},{"type":{"label":")"},"range":[18,19]}]',
        visitorKeys: JSON.stringify(estraverse.VisitorKeys)
      },
      args: [
        {
          value: false,
          events: [
            {
              value: 'FOO',
              espath: 'arguments/0/left'
            },
            {
              value: 'BAR',
              espath: 'arguments/0/right'
            },
            {
              value: false,
              espath: 'arguments/0'
            }
          ]
        }
      ]
    };

    assert(typeof alreadyParsed.source.ast === 'string');
    assert(typeof alreadyParsed.source.tokens === 'string');
    assert(typeof alreadyParsed.source.visitorKeys === 'string');

    const reducer = new AstReducer();
    reducer.onStart(alreadyParsed);

    assert(typeof alreadyParsed.source.ast === 'object');
    assert(typeof alreadyParsed.source.tokens === 'object');
    assert(typeof alreadyParsed.source.visitorKeys === 'object');
  });

  describe('Bug reproduction case', () => {
    it('Enhanced Object Literals', () => {
      const context = {
        source: {
          content: 'assert.deepEqual({ name, [ `${name} greet` ]: `Hello, I am ${name}` }, null);',
          filepath: 'test/some_test.js',
          line: 1
        },
        args: [
        ]
      };
      const reducer = new AstReducer();
      reducer.onStart(context);
      const expected = {
        source: {
          content: 'assert.deepEqual({ name, [ `${name} greet` ]: `Hello, I am ${name}` }, null);',
          filepath: 'test/some_test.js',
          line: 1,
          ast: JSON.parse('{"type":"CallExpression","callee":{"type":"MemberExpression","object":{"type":"Identifier","name":"assert","range":[0,6]},"property":{"type":"Identifier","name":"deepEqual","range":[7,16]},"computed":false,"range":[0,16]},"arguments":[{"type":"ObjectExpression","properties":[{"type":"Property","key":{"type":"Identifier","name":"name","range":[19,23]},"value":{"type":"Identifier","name":"name","range":[19,23]},"kind":"init","method":false,"shorthand":true,"computed":false,"range":[19,23]},{"type":"Property","key":{"type":"TemplateLiteral","quasis":[{"type":"TemplateElement","tail":false,"value":{"raw":"","cooked":""},"range":[28,28]},{"type":"TemplateElement","tail":true,"value":{"raw":" greet","cooked":" greet"},"range":[35,41]}],"expressions":[{"type":"Identifier","name":"name","range":[30,34]}],"range":[27,42]},"value":{"type":"TemplateLiteral","quasis":[{"type":"TemplateElement","tail":false,"value":{"raw":"Hello, I am ","cooked":"Hello, I am "},"range":[47,59]},{"type":"TemplateElement","tail":true,"value":{"raw":"","cooked":""},"range":[66,66]}],"expressions":[{"type":"Identifier","name":"name","range":[61,65]}],"range":[46,67]},"kind":"init","method":false,"shorthand":false,"computed":true,"range":[25,67]}],"range":[17,69]},{"type":"Literal","value":null,"range":[71,75]}],"range":[0,76]}'),
          tokens: JSON.parse('[{"type":{"label":"name"},"value":"assert","range":[0,6]},{"type":{"label":"."},"range":[6,7]},{"type":{"label":"name"},"value":"deepEqual","range":[7,16]},{"type":{"label":"("},"range":[16,17]},{"type":{"label":"{"},"range":[17,18]},{"type":{"label":"name"},"value":"name","range":[19,23]},{"type":{"label":","},"range":[23,24]},{"type":{"label":"["},"range":[25,26]},{"type":{"label":"`"},"range":[27,28]},{"type":{"label":"template"},"value":"","range":[28,28]},{"type":{"label":"${"},"range":[28,30]},{"type":{"label":"name"},"value":"name","range":[30,34]},{"type":{"label":"}"},"range":[34,35]},{"type":{"label":"template"},"value":" greet","range":[35,41]},{"type":{"label":"`"},"range":[41,42]},{"type":{"label":"]"},"range":[43,44]},{"type":{"label":":"},"range":[44,45]},{"type":{"label":"`"},"range":[46,47]},{"type":{"label":"template"},"value":"Hello, I am ","range":[47,59]},{"type":{"label":"${"},"range":[59,61]},{"type":{"label":"name"},"value":"name","range":[61,65]},{"type":{"label":"}"},"range":[65,66]},{"type":{"label":"template"},"value":"","range":[66,66]},{"type":{"label":"`"},"range":[66,67]},{"type":{"label":"}"},"range":[68,69]},{"type":{"label":","},"range":[69,70]},{"type":{"label":"null"},"value":"null","range":[71,75]},{"type":{"label":")"},"range":[75,76]},{"type":{"label":";"},"range":[76,77]}]'),
          visitorKeys: estraverse.VisitorKeys
        },
        args: [
        ]
      };
      assert.deepStrictEqual(context, expected);
    });
  });

  it('degrade gracefully when there are some parse errors caused by not supported syntax', () => {
    const context = {
      source: {
        content: 'assert(shallow(<Foo />).contains(<div className="foo" />));',
        filepath: 'test/some_test.js',
        line: 1
      },
      args: [
      ]
    };
    const reducer = new AstReducer();
    reducer.onStart(context);
    assert(context.source.error);
    assert(context.source.error instanceof SyntaxError);
  });

  it('support async function', () => {
    const context = {
      source: {
        async: true,
        content: 'assert(await a === await b)',
        filepath: 'test/some_test.js'
      },
      args: []
    };
    const reducer = new AstReducer();
    reducer.onStart(context);
    const expected = {
      source: {
        async: true,
        content: 'assert(await a === await b)',
        filepath: 'test/some_test.js',
        ast: JSON.parse('{"type":"CallExpression","callee":{"type":"Identifier","name":"assert","range":[0,6]},"arguments":[{"type":"BinaryExpression","operator":"===","left":{"type":"AwaitExpression","argument":{"type":"Identifier","name":"a","range":[13,14]},"range":[7,14]},"right":{"type":"AwaitExpression","argument":{"type":"Identifier","name":"b","range":[25,26]},"range":[19,26]},"range":[7,26]}],"range":[0,27]}'),
        tokens: JSON.parse('[{"type":{"label":"name"},"value":"assert","range":[0,6]},{"type":{"label":"("},"range":[6,7]},{"type":{"label":"name"},"value":"await","range":[7,12]},{"type":{"label":"name"},"value":"a","range":[13,14]},{"type":{"label":"==/!=/===/!=="},"value":"===","range":[15,18]},{"type":{"label":"name"},"value":"await","range":[19,24]},{"type":{"label":"name"},"value":"b","range":[25,26]},{"type":{"label":")"},"range":[26,27]}]'),
        visitorKeys: estraverse.VisitorKeys
      },
      args: []
    };
    assert.deepStrictEqual(context, expected);
  });
});
