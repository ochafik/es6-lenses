// Important: this example requires ES6 support.
// When running in runkit, please select Node 6.x in the drop-down below.

const assert = require('assert');
const {lens} = require("es6-lenses")

const obj = {x: {y: 1}, z: 2}
const xy = lens(_ => _.x.y)
const yz = lens(_ => [_.x.y, _.z])

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
