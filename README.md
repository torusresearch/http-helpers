# Http helpers

[![npm version](https://badge.fury.io/js/%40toruslabs%2Fhttp-helpers.svg)](https://badge.fury.io/js/%40toruslabs%2Fhttp-helpers)
![npm](https://img.shields.io/npm/dw/@toruslabs/http-helpers)

## Introduction

- This package allows you to call http methods with pre defined configs. Uses fetch or node-fetch internally
- Adds support for api keys
- Works in both browser and node.js environments

## Installation

### Bundling
This module is distributed in 3 formats
- `lib.esm` build `dist/lib.esm.js` in es6 format
- `lib.cjs` build `dist/lib.cjs.js` in es5 format
- `umd` build `dist/httpHelpers.umd.min.js` in es5 format without polyfilling corejs minified

By default, the appropriate format is used for your specified usecase
You can use a different format (if you know what you're doing eg. node) by referencing the correct file


### Directly in Browser

CDN's serve the non-core-js polyfilled version by default. You can use a different

jsdeliver

```js
<script src="https://cdn.jsdelivr.net/npm/@toruslabs/http-helpers"></script>
```

unpkg

```js
<script src="https://unpkg.com/@toruslabs/http-helpers"></script>
```

## Usage

Add [`@toruslabs/http-helpers`](https://www.npmjs.com/package/@toruslabs/http-helpers) to your project:

```ts
import { get, post } from "@toruslabs/http-helpers";
```

```js
const { get, post } = require("@toruslabs/http-helpers").default;
```

## Requirements

- This package requires a peer dependency of `@babel/runtime`
- Node 20+
