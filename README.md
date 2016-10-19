# ES6 Lenses [![Build Status](https://travis-ci.org/ochafik/es6-lenses.svg?branch=master)](https://travis-ci.org/ochafik/es6-lenses) [![npm version](https://badge.fury.io/js/es6-lenses.svg)](https://badge.fury.io/js/es6-lenses)

Proxy-powered functional lenses for ECMAScript 2015+ projects.

## Usage

```js
let xy = lens(_ => _.x.y);

console.log(xy({x: {y: 123}})) // 123
console.log(xy({})) // undefined
```

## Develop

```bash
npm i
npm start
```
