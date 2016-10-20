import {expect} from 'chai';
import {lens} from "../src/lenses";

describe("lens", function() {
  let xyz = lens<any, any>(_ => _.x.y.z);

  it("get values", function() {
    expect(xyz({})).to.eql(undefined);
    expect(xyz({x: {y: {z: 666}}})).to.eql(666);
    expect(lens(['x', 'y', 'z'])({x: {y: {z: 666}}})).to.eql(666);
  });

  it("clone with value update", function() {
    let o = {x: {y: {z: 123}}};
    let c = xyz(o, 999);
    expect(o.x.y.z).to.eql(123);
    expect(c.x.y.z).to.eql(999);
  });

  it("clone with value update even if path doesnt exist yet", function() {
    let o = {} as any;
    let c = xyz(o, 789);
    expect(o.x).to.eql(undefined);
    expect(c.x.y.z).to.eql(789);
  });
});
