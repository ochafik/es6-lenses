# ES6 Lenses [![Build Status](https://travis-ci.org/ochafik/es6-lenses.svg?branch=master)](https://travis-ci.org/ochafik/es6-lenses) [![npm version](https://badge.fury.io/js/es6-lenses.svg)](https://badge.fury.io/js/es6-lenses)

Proxy-powered functional lenses for ECMAScript 2015+ & TypeScript projects ([try it in your browser now!](https://runkit.com/npm/es6-lenses))

```js
// Install: `npm i --save es6-lenses`
const {lens} = require("es6-lenses")
const obj = {x: {y: 1}, z: 2}

// Flow / TypeScript alternative:
//   lens((_: typeof obj) => _.x.y)
const xy = lens(_.x.y)
xy.get(obj) // 1
xy.set(obj, 10) // {x: {y: 10}, z: 2}

// Composite lenses work well:
const y_z = lens([_.x.y, {z: _.z}])
y_z.get(obj) // ['y', {z: 'z'}]
y_z.set(obj, ['yy', {z: 'zz'}])
// {x: {y: 'yy'}, z: 'zz'}
```

Note: `.set` deeply clones objects (and is [Immutable.Map](https://facebook.github.io/immutable-js/docs/#/Map)-aware), while `.mutate` attempts to modify them in-place.

## About lenses

- [Functional Lenses, How Do They Work
](https://medium.com/@dtipson/functional-lenses-d1aba9e52254#.gh2bl2ym4)
- [Lenses with Immutable.js
](https://medium.com/@drboolean/lenses-with-immutable-js-9bda85674780#.r2a8on3rh)
- Great pre-existing lens libraries ([see npmjs](https://www.npmjs.com/search?q=lenses)):
  - https://github.com/calmm-js/partial.lenses
  - https://github.com/roman01la/js-lenses
  - https://github.com/fantasyland/fantasy-lenses
  - https://github.com/tomasdeml/lenticular.ts
  - https://github.com/beezee/statelens

## TODO

- Support filtered / mapped semantics: `lens(_ => _.addresses.map(_ => _.zipCode)).mapped.update(toUpperCase)`
- More examples about tuple / object inputs & outputs.
- More tests, especially re/ integration with Immutable (cover interaction w/ Record)

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
