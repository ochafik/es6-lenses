# ES6 Lenses [![Build Status](https://travis-ci.org/ochafik/es6-lenses.svg?branch=master)](https://travis-ci.org/ochafik/es6-lenses) [![npm version](https://badge.fury.io/js/es6-lenses.svg)](https://badge.fury.io/js/es6-lenses)

Proxy-powered functional lenses for ECMAScript 2015+ & TypeScript projects.

```js
const {lens} = require("es6-lenses")
const xy = lens(_ => _.x.y)
let obj = {x: {y: 1}, z: 1}
console.log(`Get: ${xy.get(obj)}`) // 1
console.log(`Update: ${JSON.stringify(xy.update(obj, 10))}`)
console.log(`Update from scratch: ${JSON.stringify(xy.update({}, 10))}`)
```

## TODO

- support tuple / object outputs (`lens(_ => [_.X, _.Y]) `) 
- support tuple / object inputs 
- Support Immutable.Map.updateIn and similar methods.

## Usage

Add to your project with:
```bash
npm i --save es6-lenses
```

Then use as follows
```js
import {lens} from 'es6-lenses';
let xy = lens(_ => _.x.y);

console.log(xy.get({})) // undefined

let obj = {x: {y: 123}};
console.log(xy.get(obj)) // 123
let clone = xy.update(obj, 666); // obj is unmodified
console.log(obj.x.y) // 123
console.log(clone.x.y) // 666

obj = {};
xy.update(obj, 111); // {x: {y: 111}}
```

There is also a mutating lens variant, which will update the objects in place instead of creating deeply-updated clones.

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
