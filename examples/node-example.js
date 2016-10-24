// Important: please select Node 6.x in the drop-down below, as this example requires ES6

const assert = require('assert');
const {lens} = require("es6-lenses")

const obj = {x: {y: 1}, z: 2}
const xy = lens(_ => _.x.y)
const yz = lens(_ => [_.x.y, _.z])

// Get
assert.deepEqual(xy.get(obj), 1)
assert.deepEqual(yz.get(obj), [1, 2])

// Update
assert.deepEqual(xy.update(obj, 10), {x: {y: 10}, z: 2})
assert.deepEqual(yz.update(obj, [11, 22]), {x: {y: 11}, z: 22})

// Update from scratch
assert.deepEqual(xy.update({}, -1), {x: {y: -1}})
assert.deepEqual(yz.update({}, [-1, -2]), {x: {y: -1}, z: -2})

// Mutate
assert.strictEqual(xy.mutate(obj, 666), obj);
assert.deepEqual(obj, {x: {y: 666}, z: 2});
assert.strictEqual(yz.mutate(obj, [111, 222]), obj);
assert.deepEqual(obj, {x: {y: 111}, z: 222});
