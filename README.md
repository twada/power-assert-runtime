[![power-assert][power-assert-banner]][power-assert-url]

[![Build Status][travis-image]][travis-url]

Reorganize [power-assert-formatter](https://github.com/power-assert-js/power-assert-formatter) and [power-assert-renderers](https://github.com/twada/power-assert-renderers) into [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) structure.


MODULES
---------------------------------------

- [power-assert-context-formatter](./packages/power-assert-context-formatter/)
- [power-assert-context-traversal](./packages/power-assert-context-traversal/)
- [power-assert-renderer-base](./packages/power-assert-renderer-base/)
- [power-assert-renderer-file](./packages/power-assert-renderer-file/)
- [power-assert-renderer-assertion](./packages/power-assert-renderer-assertion/)
- [power-assert-renderer-comparison](./packages/power-assert-renderer-comparison/)
- [power-assert-renderer-diagram](./packages/power-assert-renderer-diagram/)
- [power-assert-renderer-succinct](./packages/power-assert-renderer-succinct/)


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
