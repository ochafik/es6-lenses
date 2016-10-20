import {expect} from 'chai';
import {mutatingLens} from "../src/mutating_lenses";

describe("mutating lenses", function() {
  let xyz = mutatingLens<any, any>(_ => _.x.y.z);

  it("get values", function() {
    expect(xyz({})).to.eql(undefined);
    expect(xyz({x: {y: {z: 666}}})).to.eql(666);
  });

  it("set values", function() {
    let o = {x: {y: {z: 123}}};
    expect(xyz(o, 999)).to.eq(o);
    expect(o.x.y.z).to.eql(999);
  });

  it("set values even if path doesnt exist yet", function() {
    let o = {} as any;
    expect(xyz(o, 789)).to.eq(o);
    expect(o.x.y.z).to.eql(789);
  });
});