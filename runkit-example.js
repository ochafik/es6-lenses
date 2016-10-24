// Important: please select Node 6.x in the drop-down below, as this example requires ES6

const {lens} = require("es6-lenses")

const xy = lens(_ => _.x.y)

let obj = {x: {y: 1}, z: 1}
console.log(`Get: ${xy.get(obj)}`) // 1
console.log(`Update: ${JSON.stringify(xy.update(obj, 10))}`)
console.log(`Update from scratch: ${JSON.stringify(xy.update({}, 10))}`)
