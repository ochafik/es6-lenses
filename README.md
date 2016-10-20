# ES6 Lenses [![Build Status](https://travis-ci.org/ochafik/es6-lenses.svg?branch=master)](https://travis-ci.org/ochafik/es6-lenses) [![npm version](https://badge.fury.io/js/es6-lenses.svg)](https://badge.fury.io/js/es6-lenses)

Proxy-powered functional lenses for ECMAScript 2015+ projects.

## TODO

- Turn setters into cloners instead of mutators (keep mutating variant around with explicit naming).

## Usage

Add to your project with:
```bash
npm i --save es6-lenses
```

Then use as follows
```js
import {lens} from 'es6-lenses';
let xy = lens(_ => _.x.y);

console.log(xy({})) // undefined

let obj = {x: {y: 123}};
console.log(xy(obj)) // 123
xy(obj, 666);
console.log(obj.x.y) // 666

obj = {};
xy(obj, 111); // Will create the path.
console.log(obj.x.y) // 111
```

##  Bundling with rollup

Notes:

- Can't down-compile to ES5 as we're using ES6's [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- UglifyJS might require a special ES6-friendly branch: please report any success :-)

Setup:

- Prerequisite:

  ```
  npm --save-dev rollup
  npm --save-dev rollup-watch
  npm --save-dev rollup-plugin-typescript
  npm --save-dev rollup-plugin-node-resolve
  ```

- Config (`rollup.config.js`):

  ```js
  import typescript from 'rollup-plugin-typescript';
  import nodeResolve from 'rollup-plugin-node-resolve';

  export default {
    entry: './main.ts',
    format: 'iife',
    dest: 'out.js',
    sourceMap: true,
    plugins: [
      nodeResolve({jsnext: true, main: true}),
      typescript({
        typescript: require('typescript')
      }),
    ]
  }
  ```

- Add the following scripts to your `package.json`:

  ```js
  {
    "scripts": {
      "rollup": "rollup -c",
      "rollup:w": "rollup -c -w"
    },
    ...
  }
  ```

- Build with `npm run rollup`, continuously rebuild with `npm run rollup:w`

## Develop

```bash
npm i
npm start
```
