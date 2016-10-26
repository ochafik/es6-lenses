// Important: this example requires ES6 support.

import * as assert from 'assert';
import {_, lens} from 'es6-lenses';

const obj = {x: {y: 1}, z: 2}

// This lens isn't typed, yuck!
const x = lens(_.x)

// This is a Lens<typeof obj, number>:
const xy = lens((_: typeof obj) => _.x.y)

// This is a Lens<typeof obj, number[]>:
const yz = lens((_: typeof obj) => [_.x.y, _.z])

// Get
assert.deepEqual(xy.get(obj), 1)
assert.deepEqual(yz.get(obj), [1, 2])

// Set
assert.deepEqual(xy.set(obj, 10), {x: {y: 10}, z: 2})
assert.deepEqual(yz.set(obj, [11, 22]), {x: {y: 11}, z: 22})

// Set from scratch
assert.deepEqual(xy.set(Object.create(null), -1), {x: {y: -1}})
assert.deepEqual(yz.set(Object.create(null), [-1, -2]), {x: {y: -1}, z: -2})

// Mutate
assert.strictEqual(xy.mutate(obj, 666), obj)
assert.deepEqual(obj, {x: {y: 666}, z: 2})
assert.strictEqual(yz.mutate(obj, [111, 222]), obj)
assert.deepEqual(obj, {x: {y: 111}, z: 222})

console.log('OK!')
