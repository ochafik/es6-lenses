// Important: this example requires ES6 support.
// Looking for typed examples? Open flow-or-typescript-example.ts

const assert = require('assert');
const {_, lens} = require("es6-lenses")

const obj = {x: {y: 1}, z: 2}

// Typed (Flow / TypeScript) alternative:
//         lens((_: typeof obj) => _.x.y)
const xy = lens(_.x.y)

// Typed (Flow / TypeScript) alternative:
//         lens((_: typeof obj) => [_.x.y, _.z])
const yz = lens([_.x.y, _.z])

// Direct call (~ get)
assert.deepEqual(xy(obj), 1)
assert.deepEqual(yz(obj), [1, 2])

// Get
assert.deepEqual(xy.get(obj), 1)
assert.deepEqual(yz.get(obj), [1, 2])

// Set
assert.deepEqual(xy.set(obj, 10), {x: {y: 10}, z: 2})
assert.deepEqual(yz.set(obj, [11, 22]), {x: {y: 11}, z: 22})

// Set from scratch
assert.deepEqual(xy.set({}, -1), {x: {y: -1}})
assert.deepEqual(yz.set({}, [-1, -2]), {x: {y: -1}, z: -2})

// Mutate
assert.strictEqual(xy.mutate(obj, 666), obj)
assert.deepEqual(obj, {x: {y: 666}, z: 2})
assert.strictEqual(yz.mutate(obj, [111, 222]), obj)
assert.deepEqual(obj, {x: {y: 111}, z: 222})

console.log('OK!')
