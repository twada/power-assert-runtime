[![power-assert][power-assert-banner]][power-assert-url]

[![Build Status][travis-image]][travis-url]

Reorganize [power-assert-formatter](https://github.com/power-assert-js/power-assert-formatter) and [power-assert-renderers](https://github.com/twada/power-assert-renderers) into [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) structure.


MODULES
---------------------------------------

- [power-assert-context-formatter](https://github.com/twada/power-assert-runtime/blob/master/packages/power-assert-context-formatter/README.md): format power-assert context
- [power-assert-context-traversal](https://github.com/twada/power-assert-runtime/blob/master/packages/power-assert-context-traversal/README.md): traverse power-assert context
- [power-assert-renderer-base](https://github.com/twada/power-assert-runtime/blob/master/packages/power-assert-renderer-base/README.md): base renderer for power-assert context
- [power-assert-renderer-file](https://github.com/twada/power-assert-runtime/blob/master/packages/power-assert-renderer-file/README.md): filepath renderer for power-assert context
- [power-assert-renderer-assertion](https://github.com/twada/power-assert-runtime/blob/master/packages/power-assert-renderer-assertion/README.md): assertion renderer for power-assert context
- [power-assert-renderer-comparison](https://github.com/twada/power-assert-runtime/blob/master/packages/power-assert-renderer-comparison/README.md): comparison renderer for power-assert context
- [power-assert-renderer-diagram](https://github.com/twada/power-assert-runtime/blob/master/packages/power-assert-renderer-diagram/README.md): diagram renderer for power-assert context
- [power-assert-renderer-succinct](https://github.com/twada/power-assert-runtime/blob/master/packages/power-assert-renderer-succinct/README.md): succinct diagram renderer for power-assert context


DESIGN DECISION
---------------------------------------

- Unbundle ECMAScript parser from runtime side
- Make each module lightweight and small as possible
- Avoid unnecessary dependencies
- Make renderers less dynamic and statically analyzable. No dynamic require.


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
