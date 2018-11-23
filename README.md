[![power-assert][power-assert-banner]][power-assert-url]

[![Build Status][travis-image]][travis-url]
[![Code Style][style-image]][style-url]
[![License][license-image]][license-url]

Reorganize [empower](https://github.com/power-assert-js/empower), [power-assert-formatter](https://github.com/power-assert-js/power-assert-formatter) and [power-assert-renderers](https://github.com/twada/power-assert-renderers) into [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) structure.


MODULES
---------------------------------------

- [empower-core](./packages/empower-core/)
- [power-assert-context-formatter](./packages/power-assert-context-formatter/)
- [power-assert-context-traversal](./packages/power-assert-context-traversal/)
- [power-assert-context-reducer-ast](./packages/power-assert-context-reducer-ast/)
- [power-assert-renderer-base](./packages/power-assert-renderer-base/)
- [power-assert-renderer-file](./packages/power-assert-renderer-file/)
- [power-assert-renderer-assertion](./packages/power-assert-renderer-assertion/)
- [power-assert-renderer-comparison](./packages/power-assert-renderer-comparison/)
- [power-assert-renderer-diagram](./packages/power-assert-renderer-diagram/)
- [power-assert-renderer-succinct](./packages/power-assert-renderer-succinct/)
- [power-assert-util-string-width](./packages/power-assert-util-string-width/)


DESIGN DECISION
---------------------------------------

- Make ECMAScript parser optional at runtime
- Make each module lightweight and small as possible
- Avoid unnecessary dependencies
- Make renderers less dynamic and statically analyzable. No dynamic require.


OUR SUPPORT POLICY
---------------------------------------

For the Transpiler side, we support Node under maintenance. In other words, we stop supporting old Node version when [their maintenance ends](https://github.com/nodejs/LTS).

For the Runtime side, we support [Node under maintenance](https://github.com/nodejs/LTS) and "modern enough" browsers such as Chrome, Firefox, Safari, Edge etc.

Any other environments are not supported officially (means that we do not test against them on CI service). power-assert is known to work with old browsers, and trying to keep them working though.


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

[style-url]: https://github.com/Flet/semistandard
[style-image]: https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg

[license-url]: https://github.com/twada/power-assert-runtime/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg
