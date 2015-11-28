empower-core
================================

[![Build Status][travis-image]][travis-url]
[![NPM package][npm-image]][npm-url]
[![Bower package][bower-image]][bower-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Code Climate][codeclimate-image]][codeclimate-url]
[![License][license-image]][license-url]
[![Built with Gulp][gulp-image]][gulp-url]


Power Assert feature enhancer for assert function/object.


DESCRIPTION
---------------------------------------
`empower-core` is a core module of [power-assert](http://github.com/power-assert-js/power-assert) family. `empower-core` enhances standard `assert` function or any assert-like object to work with power-assert feature added code instrumented by [espower](http://github.com/power-assert-js/espower).


`empower-core` works with standard `assert` function (best fit with [Mocha](http://visionmedia.github.io/mocha/)), and also supports assert-like objects/functions provided by various testing frameworks such as [QUnit](http://qunitjs.com/), [buster.js](http://docs.busterjs.org/en/latest/), and [nodeunit](https://github.com/caolan/nodeunit).


Pull-requests, issue reports and patches are always welcomed. See [power-assert](http://github.com/power-assert-js/power-assert) project for more documentation.


CHANGELOG
---------------------------------------
See [CHANGELOG](https://github.com/twada/empower-core/blob/master/CHANGELOG.md)


API
---------------------------------------

### var enhancedAssert = empowerCore(originalAssert, [options])

| return type            |
|:-----------------------|
| `function` or `object` |

`empower-core` function takes function or object(`originalAssert`) then returns PowerAssert feature added function/object based on `originalAssert`.
If `destructive` option is falsy, `originalAssert` will be unchanged. If `destructive` option is truthy, `originalAssert` will be manipulated directly and returned `enhancedAssert` will be the same instance of `originalAssert`.


#### originalAssert

| type                   | default value |
|:-----------------------|:--------------|
| `function` or `object` | N/A           |

`originalAssert` is an instance of standard `assert` function or any assert-like object. see [SUPPORTED ASSERTION LIBRARIES](https://github.com/twada/empower-core#supported-assertion-libraries) and [ASSERTION LIBRARIES KNOWN TO WORK](https://github.com/twada/empower-core#assertion-libraries-known-to-work) section. Be careful that `originalAssert` will be manipulated directly if `destructive` option is truthy.


#### options

| type     | default value |
|:---------|:--------------|
| `object` | (return value of `empowerCore.defaultOptions()`) |

Configuration options. If not passed, default options will be used.


#### options.destructive

| type      | default value |
|:----------|:--------------|
| `boolean` | `false`       |

If truthy, modify `originalAssert` destructively.

If `false`, empower-core mimics originalAssert as new object/function, so `originalAssert` will not be changed. If `true`, `originalAssert` will be manipulated directly and returned `enhancedAssert` will be the same instance of `originalAssert`.


#### options.onError

| type       | default value |
|:-----------|:--------------|
| `function` | (function defined in `empowerCore.defaultOptions()`) |

TBD


#### options.onSuccess

| type       | default value |
|:-----------|:--------------|
| `function` | (function defined in `empowerCore.defaultOptions()`) |

TBD


#### options.patterns

| type                | default value       |
|:--------------------|:--------------------|
| `Array` of `string` | objects shown below |

```javascript
[
    'assert(value, [message])',
    'assert.ok(value, [message])',
    'assert.equal(actual, expected, [message])',
    'assert.notEqual(actual, expected, [message])',
    'assert.strictEqual(actual, expected, [message])',
    'assert.notStrictEqual(actual, expected, [message])',
    'assert.deepEqual(actual, expected, [message])',
    'assert.notDeepEqual(actual, expected, [message])',
    'assert.deepStrictEqual(actual, expected, [message])',
    'assert.notDeepStrictEqual(actual, expected, [message])'
]
```

Target patterns for power assert feature instrumentation.

Pattern detection is done by [call-signature](https://github.com/jamestalmage/call-signature). Any arguments enclosed in bracket (for example, `[message]`) means optional parameters. Without bracket means mandatory parameters.


### var options = empowerCore.defaultOptions();

Returns default options object for `empowerCore` function. In other words, returns

```javascript
{
    destructive: false,
    onError: onError,
    onSuccess: onSuccess,
    patterns: [
        'assert(value, [message])',
        'assert.ok(value, [message])',
        'assert.equal(actual, expected, [message])',
        'assert.notEqual(actual, expected, [message])',
        'assert.strictEqual(actual, expected, [message])',
        'assert.notStrictEqual(actual, expected, [message])',
        'assert.deepEqual(actual, expected, [message])',
        'assert.notDeepEqual(actual, expected, [message])',
        'assert.deepStrictEqual(actual, expected, [message])',
        'assert.notDeepStrictEqual(actual, expected, [message])'
    ]
}
```

with sensible default for `onError` and `onSuccess`

```js
function onError (errorEvent) {
    var e = errorEvent.error;
    if (errorEvent.powerAssertContext && e.name === 'AssertionError') {
        e.powerAssertContext = errorEvent.powerAssertContext;
    }
    throw e;
}

function onSuccess(successEvent) {
    return successEvent.returnValue;
}
```


SUPPORTED ASSERTION LIBRARIES
---------------------------------------
* [Node assert API](http://nodejs.org/api/assert.html)


ASSERTION LIBRARIES KNOWN TO WORK
---------------------------------------
* [QUnit.assert](http://qunitjs.com/)
* [nodeunit](https://github.com/caolan/nodeunit)
* [buster-assertions](http://docs.busterjs.org/en/latest/modules/buster-assertions/)


INSTALL
---------------------------------------

### via npm

Install

    $ npm install --save-dev empower-core


#### use empower-core npm module on browser

`empowerCore` function is exported

    <script type="text/javascript" src="./path/to/node_modules/empower-core/build/empower-core.js"></script>


### via bower

Install

    $ bower install --save-dev empower-core

Then load (`empowerCore` function is exported)

    <script type="text/javascript" src="./path/to/bower_components/empower-core/build/empower-core.js"></script>


AUTHOR
---------------------------------------
* [Takuto Wada](http://github.com/twada)


CONTRIBUTORS
---------------------------------------
* [James Talmage (jamestalmage)](https://github.com/jamestalmage)


LICENSE
---------------------------------------
Licensed under the [MIT](https://github.com/twada/empower-core/blob/master/MIT-LICENSE.txt) license.


[npm-url]: https://npmjs.org/package/empower-core
[npm-image]: https://badge.fury.io/js/empower-core.svg

[bower-url]: http://badge.fury.io/bo/empower-core
[bower-image]: https://badge.fury.io/bo/empower-core.svg

[travis-url]: http://travis-ci.org/twada/empower-core
[travis-image]: https://secure.travis-ci.org/twada/empower-core.svg?branch=master

[depstat-url]: https://gemnasium.com/twada/empower-core
[depstat-image]: https://gemnasium.com/twada/empower-core.svg

[license-url]: https://github.com/twada/empower-core/blob/master/MIT-LICENSE.txt
[license-image]: http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat

[codeclimate-url]: https://codeclimate.com/github/twada/empower-core
[codeclimate-image]: https://codeclimate.com/github/twada/empower-core/badges/gpa.svg

[coverage-url]: https://coveralls.io/r/twada/empower-core?branch=master
[coverage-image]: https://coveralls.io/repos/twada/empower-core/badge.svg?branch=master

[gulp-url]: http://gulpjs.com/
[gulp-image]: http://img.shields.io/badge/built_with-gulp-brightgreen.svg
