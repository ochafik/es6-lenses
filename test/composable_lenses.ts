import {expect} from 'chai';
import {lens} from "../src/composable_lenses";

describe("lens", function() {

  it("get path values", function() {
    let xyz = lens<any, any>(_ => _.x.y.z);

    expect(xyz.get({})).to.eql(undefined);
    expect(xyz.get({x: {y: {z: 666}}})).to.eql(666);
    // expect(lens(['x', 'y', 'z']).get({x: {y: {z: 666}}})).to.eql(666);
  });

  it("clone with value update", function() {
    let xyz = lens<any, any>(_ => _.x.y.z);

    let o = {x: {y: {z: 123}}};
    let c = xyz.update(o, 999);
    expect(o.x.y.z).to.eql(123);
    expect(c.x.y.z).to.eql(999);
  });

  it("clone with value update even if path doesnt exist yet", function() {
    let xyz = lens<any, any>(_ => _.x.y.z);

    let o = {} as any;
    let c = xyz.update(o, 789);
    expect(o.x).to.eql(undefined);
    expect(c.x.y.z).to.eql(789);
  });

  it("get composite array values", function() {
    let xyz = lens<any, any>(_ => [_.x, _.y.z]);
    expect(xyz.toString()).to.eql('[_.x, _.y.z]');
    let o = {x: 'x', y: {z: 'z'}, w: 1};

    expect(xyz.get(o)).to.eql(['x', 'z']);
    expect(xyz.update(o, ['x2', 'z2'])).to.eql({x: 'x2', y: {z: 'z2'}, w: 1});
  });

  it("get composite object values", function() {
    let xyz = lens<any, any>(_ => ({a: _.x, b: _.y.z}));
    expect(xyz.toString()).to.eql('{a: _.x, b: _.y.z}');
    let o = {x: 'x', y: {z: 'z'}, w: 1};

    expect(xyz.get(o)).to.eql({a: 'x', b: 'z'});
    expect(xyz.update(o, {a: 'x2', b: 'z2'})).to.eql({x: 'x2', y: {z: 'z2'}, w: 1});
  });

  it("get nested composite values", function() {
    let xyz = lens<any, any>(_ => ({a: _.x, b: [_.w, _.y.z]}));
    let o = {x: 'x', y: {z: 'z'}, w: 1};

    expect(xyz.get(o)).to.eql({a: 'x', b: [1, 'z']});
    expect(xyz.update(o, {a: 'x2', b: [0, 'zoo']})).to.eql({x: 'x2', y: {z: 'zoo'}, w: 0});
  });

  it("appends selectors", function() {
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
    // expect(xy.after(ab).toString()).to.eql('[_.x.y.a, _.x.y.b]');
  });
});
