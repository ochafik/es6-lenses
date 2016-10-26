import {_, lens} from "../src";
import {expectImmutable} from './expect_immutable';
import {expect} from 'chai';
import Immutable = require('immutable'); 

describe("lens", () => {

  it("get path values with _ lenses", () => {
    let xyz = lens([_.x.y.z, _.w]);

    expect(xyz.get({})).to.eql([undefined, undefined]);
    expect(xyz.get({w: 1, x: {y: {z: 666}}})).to.eql([666, 1]);
    // expect(lens(['x', 'y', 'z']).get({x: {y: {z: 666}}})).to.eql(666);
  });

  it("get path values", () => {
    let xyz = lens(_.x.y.z);

    expect(xyz.get({})).to.eql(undefined);
    expect(xyz.get({x: {y: {z: 666}}})).to.eql(666);
    // expect(lens(['x', 'y', 'z']).get({x: {y: {z: 666}}})).to.eql(666);
  });

  it("clone with value set", () => {
    let o = {x: {y: {r: 1, z: 123}}};
    let xyz = lens((_: typeof o) => _.x.y.z);

    let c = xyz.set(o, 999);
    expect(o.x.y.z).to.eql(123);
    expect(c.x.y.z).to.eql(999);
    expect(c.x.y.r).to.eql(1);
  });

  it("preserves identity when no real change", () => {
    let o = {x: {y: {r: 1, z: 123}}};
    let xyz = lens((_: typeof o) => _.x.y.z);
    
    expect(xyz.set(o, 123)).to.equal(o);
  });

  it("clone with value set even if path doesnt exist yet", () => {
    let xyz = lens<any, any>(_ => _.x.y.z);

    let o = {} as any;
    let c = xyz.set(o, 789);
    expect(o.x).to.eql(undefined);
    expect(c.x.y.z).to.eql(789);
  });

  it("mutates values", () => {
    let o = {x: {y: {r: 1, z: 123}}};
    let xyz = lens((_: typeof o) => _.x.y.z);
    
    expect(xyz.mutate(o, 999)).to.eq(o);
    expect(o.x.y.z).to.eql(999);
  });

  it("mutates values even if path doesnt exist yet", () => {
    let xyz = lens(_.x.y.z);

    let o = {} as any;
    expect(xyz.mutate(o, 789)).to.eq(o);
    expect(o.x.y.z).to.eql(789);
  });

  it("get composite array values", () => {
    let o = {w: 1, x: 'x', y: {z: 'z'}};
    let xyz = lens((_: typeof o) => [_.x, _.y.z]);

    expect(xyz.toString()).to.eql('[_.x, _.y.z]');
    expect(xyz.get(o)).to.eql(['x', 'z']);
    expect(xyz.set(o, ['x2', 'z2'])).to.eql({w: 1, x: 'x2', y: {z: 'z2'}});
  });

  it("get composite object values", () => {
    let o = {w: 1, x: 'x', y: {z: 'z'}};
    let xyz = lens((_: typeof o) => ({a: _.x, b: _.y.z}));

    expect(xyz.toString()).to.eql('{a: _.x, b: _.y.z}');
    expect(xyz.get(o)).to.eql({a: 'x', b: 'z'});
    expect(xyz.set(o, {a: 'x2', b: 'z2'})).to.eql({w: 1, x: 'x2', y: {z: 'z2'}});
  });

  it("get nested composite values", () => {
    let o = {w: 1, x: 'x', y: {z: 'z'}};
    let xyz = lens((_: typeof o) => ({a: _.x, b: [_.w, _.y.z]}));

    expect(xyz.get(o)).to.eql({a: 'x', b: [1, 'z']});
    expect(xyz.set(o, {a: 'x2', b: [0, 'zoo']})).to.eql({w: 0, x: 'x2', y: {z: 'zoo'}});
  });

  it("appends selectors", () => {
    const ab = lens((_: any) => _.a.b);
    const xy = lens((_: any) => _.x.y);
    const zw = lens((_: any) => _.z.w);
    const abArray = lens((_: any) => [_.a, _.b]);
    const abObject = lens((_: any) => ({a: _.forA, b: _.forB}));
    const xyzObject = lens((_: any) => ({x: {y: {z: _.w}}}));

    expect(xy.after(zw).toString()).to.eql('_.z.w.x.y');
    expect(xy.andThen(zw).toString()).to.eql('_.x.y.z.w');
    expect(xy.andThen(abArray).toString()).to.eql('[_.x.y.a, _.x.y.b]');
    expect(xy.andThen(abObject).toString()).to.eql('{a: _.x.y.forA, b: _.x.y.forB}');

    expect(abObject.andThen(ab).toString()).to.eql('_.forA.b');
    expect(xyzObject.andThen(xy).toString()).to.eql('{z: _.w}');
    expect(abArray.andThen(lens((_: any) => _[0])).toString()).to.eql('_.a');
  });

  it("supports Immutable.Map", () => {
    const map = Immutable.Map({x: 1, y: 2});
    const x = lens((_: any) => _.x);
    expect(x.get(map)).to.eql(1);
    expectImmutable(x.set(map, 10)).to.eql(Immutable.Map({x: 10, y: 2}));
  });
});
