[![power-assert][power-assert-banner]][power-assert-url]

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]


Create function to format `powerAssertContext` object provided by power-assert at runtime.


USAGE
---------------------------------------

```javascript
const createFormatter = require('power-assert-context-formatter');
const AstReducer = require('power-assert-context-reducer-ast');
const FileRenderer = require('power-assert-renderer-file');
const AssertionRenderer = require('power-assert-renderer-assertion');
const DiagramRenderer = require('power-assert-renderer-diagram');
const ComparisonRenderer = require('power-assert-renderer-comparison');
const ComparisonReducer = require('power-assert-context-reducer-comparison');

const format = createFormatter({
    pipeline: [
        AstReducer,
        FileRenderer,
        AssertionRenderer,
        DiagramRenderer,
        ComparisonRenderer,
        ComparisonReducer
    ]
});

const assert = require('assert');

const foo = 'foo';
const bar = 'bar';
try {
    assert(foo === bar);
} catch (e) {
    const formattedText = format(e.powerAssertContext);
    . . .
}
```


API
---------------------------------------

### const createFormatter = require('power-assert-context-formatter');

| return type |
|:------------|
| `function`  |

Returns creator function of formatter.


### const format = createFormatter(options);

| return type |
|:------------|
| `function`  |

Create format function to format `powerAssertContext` object provided by power-assert.


#### options.pipeline

| type                                         | default value |
|:---------------------------------------------|:--------------|
| `Array` of `function` or `Array` of `object` | null          |

Array of constructor function of various Renderers or Reducers.
Each Renderer is instantiated for each assertion and registered to `ContextTraversal`.

##### customization

Each renderer accepts its options via form of object literal.

```javascript
const format = createFormatter({
    pipeline: [
        { ctor: AstReducer },
        { ctor: FileRenderer },
        { ctor: AssertionRenderer },
        { ctor: DiagramRenderer, options: { maxDepth: 2 } },
        { ctor: ComparisonRenderer, options: { lineDiffThreshold: 3 } },
        { ctor: ComparisonReducer }
    ]
});
```


#### options.outputOffset

| type     | default value |
|:---------|:--------------|
| `number` | `2`           |

Number of spaces inserted at the left in power-assert output.


#### options.lineSeparator

| type     | default value |
|:---------|:--------------|
| `string` | `"\n"`        |

Line separator in power assert output.


### const formattedText = format(powerAssertContext);

| return type |
|:------------|
| `string`  |

Format `powerAssertContext` into `formattedText`. `powerAssertContext` is an internal object structure, containing informations to render. Example of `powerAssertContext` is:

```javascript
{
    source: {
        content: 'assert(foo === bar)',
        filepath: 'test/some_test.js',
        line: 1,
        ast: '### JSON representation of AST nodes ###',
        tokens: '### JSON representation of AST tokens ###',
        visitorKeys: '### JSON representation of AST visitor keys ###'
    },
    args: [
        {
            value: false,
            events: [
                {
                    value: "FOO",
                    espath: "arguments/0/left"
                },
                {
                    value: "BAR",
                    espath: "arguments/0/right"
                },
                {
                    value: false,
                    espath: "arguments/0"
                }
            ]
        }
    ]
}
```


INSTALL
---------------------------------------

```sh
$ npm install --save-dev power-assert-context-formatter
```


AUTHOR
---------------------------------------
* [Takuto Wada](https://github.com/twada)


LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/twada/power-assert-runtime/blob/master/LICENSE) license.


[power-assert-url]: https://github.com/power-assert-js/power-assert
[power-assert-banner]: https://raw.githubusercontent.com/power-assert-js/power-assert-js-logo/master/banner/banner-official-fullcolor.png

[travis-url]: https://travis-ci.org/twada/power-assert-runtime
[travis-image]: https://secure.travis-ci.org/twada/power-assert-runtime.svg?branch=master

[npm-url]: https://npmjs.org/package/power-assert-context-formatter
[npm-image]: https://badge.fury.io/js/power-assert-context-formatter.svg

[license-url]: https://github.com/twada/power-assert-runtime/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg
