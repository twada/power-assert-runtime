### [1.2.0](https://github.com/twada/power-assert-runtime/releases/tag/v1.2.0) (2018-06-12)


#### Features

* **empower-core:** [Integrate `empower-core` into monorepo](https://github.com/twada/power-assert-runtime/pull/21)
* **power-assert-context-reducer-ast:** [Support ES2018 syntax](https://github.com/twada/power-assert-runtime/pull/22)


#### Breaking Changes

* **empower-core:** (v0.6.2 -> v1.2.0 since integrated into monorepo) We stopped providing prebuilt bundle for browsers. Please build your own using browserify, webpack and so on. We also dropped bower support. Please use npm instead.


### [1.1.2](https://github.com/twada/power-assert-runtime/releases/tag/v1.1.2) (2017-04-14)


#### Bug Fixes

* **power-assert-context-reducer-ast:** [fix: ecmaVersion 7 => 2017 to support async function](https://github.com/twada/power-assert-runtime/pull/17) by [@popomore](https://github.com/popomore)


### [1.1.1](https://github.com/twada/power-assert-runtime/releases/tag/v1.1.1) (2016-11-10)


#### Chore

* **power-assert-context-reducer-ast:** upgrade acorn to ^4.0.0


### [1.1.0](https://github.com/twada/power-assert-runtime/releases/tag/v1.1.0) (2016-10-07)


#### Features

* [Degrade gracefully when there are some parse errors](https://github.com/twada/power-assert-runtime/pull/15)


#### Chore

* [Extract power-assert-util-string-width module out](https://github.com/twada/power-assert-runtime/pull/14)


### [1.0.7](https://github.com/twada/power-assert-runtime/releases/tag/v1.0.7) (2016-07-01)


#### Bug Fixes

* **power-assert-renderer-comparison:** [Use diff-match-patch instead of googlediff since googlediff manipulates this directly](https://github.com/twada/power-assert-runtime/pull/13)


### [1.0.6](https://github.com/twada/power-assert-runtime/releases/tag/v1.0.6) (2016-06-05)


#### Bug Fixes

* **power-assert-renderer-diagram:** fix custom function interop ([34565f9](https://github.com/twada/power-assert-runtime/commit/34565f9baa3235b11d60602d9b979b64d1e7332e))
* **power-assert-renderer-comparison:** fix custom function interop ([0145182](https://github.com/twada/power-assert-runtime/commit/01451824f369f5520ae696605b26891d1a7ff95c))


### [1.0.5](https://github.com/twada/power-assert-runtime/releases/tag/v1.0.5) (2016-06-05)


#### Bug Fixes

* export support functions for older implementations ([6927774](https://github.com/twada/power-assert-runtime/commit/6927774dc19520e8ceb343cc915c7b52f8da584c))


### [1.0.4](https://github.com/twada/power-assert-runtime/releases/tag/v1.0.4) (2016-06-04)


#### Bug Fixes

* **power-assert-context-formatter:** re-introduce legacy renderer compatibility layer ([d93c2dd](https://github.com/twada/power-assert-runtime/commit/d93c2dd7f2cc91d6ea438f8cb1794e1619085f5a))


### [1.0.3](https://github.com/twada/power-assert-runtime/releases/tag/v1.0.3) (2016-06-01)


#### Bug Fixes

* **power-assert-context-formatter:** remove unnecessary legacy compatibility ([cfb5fe0](https://github.com/twada/power-assert-runtime/commit/cfb5fe04b0644c66c4a9a8b1e8c21b6befa9d779))


### [1.0.2](https://github.com/twada/power-assert-runtime/releases/tag/v1.0.2) (2016-06-01)


#### Bug Fixes

* **power-assert-context-formatter:** introduce legacy formatter compatibility layer ([8a497958](https://github.com/twada/power-assert-runtime/commit/8a4979584b1cfd87598d0e778e3dc27e2819b263))
* **power-assert-context-reducer-ast:** skip already visited node to prevent error ([30419c6d](https://github.com/twada/power-assert-runtime/commit/30419c6ddd1ffd3046ab44527ee40201928f1d8e))


### [1.0.1](https://github.com/twada/power-assert-runtime/releases/tag/v1.0.1) (2016-05-31)


#### Bug Fixes

* **power-assert-runtime:** update 0.1.0 refs to 1.0.0 ([dc18466](https://github.com/twada/power-assert-runtime/commit/dc18466adaf6fc9b86ca304a959ff32f206e166c))


## [1.0.0](https://github.com/twada/power-assert-runtime/releases/tag/v1.0.0) (2016-05-31)


#### Features

  * [Make each renderer customizable via options](https://github.com/twada/power-assert-runtime/pull/5)
  * [Provide optional runtime side parser](https://github.com/twada/power-assert-runtime/pull/7)
  * [Consolidate ponyfills into core-js](https://github.com/twada/power-assert-runtime/pull/8)
  * [Change default output depth to 2](https://github.com/twada/power-assert-runtime/pull/10)


## [0.1.0](https://github.com/twada/power-assert-runtime/releases/tag/v0.1.0) (2016-04-07)


#### Features

  * initial release
