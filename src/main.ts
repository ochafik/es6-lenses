// import {lens} from './lenses';
// //
// // export function main() {
// //   console.log('Foo2');
// // }
// //
// // main();
//
// function main() {
//   let abc = lens(_ => _.a.b.c);
//   let o = {a: {b: {c: 1}}};
//   console.log(JSON.stringify(o));
//   console.log(abc(o));
//   abc(o, 10);
//   console.log(JSON.stringify(o));
//   console.log(abc(o));
// }
//
// main();
//
// (() => {
//   let AB = [{a: 1}, {b: 2}];
//   let ab = lens(([x, y]: typeof AB) => [x.a, x.b]);
//   console.log(JSON.stringify(AB));
//   console.log(ab(AB));
//   ab(AB, [10, 20]);
//   console.log(JSON.stringify(AB));
// })();
//
// // function main2() {
// //   let abc = lens(([option, data]) => [option.foo.bar, [option.x, data.x], data: y]);
// // }
//
// // const foo: Selector = {properties: []};
// // const test = new Proxy(foo, new SelectorProxyHandler());
// //
// // const [a, b, c] = test;
// //
// // console.log(JSON.stringify(foo));
