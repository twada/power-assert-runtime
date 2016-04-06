[![power-assert][power-assert-banner]][power-assert-url]

Reorganize [power-assert-formatter](https://github.com/power-assert-js/power-assert-formatter) and [power-assert-renderers](https://github.com/twada/power-assert-renderers) into [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) structure.


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
