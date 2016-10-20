import {expect} from 'chai';
import {lens} from "../src/lenses";

describe("lens", function() {
  let xyz = lens<any, any>(_ => _.x.y.z);

  it("gets values", function() {
    expect(xyz({})).to.eql(undefined);
    expect(xyz({x: {y: {z: 666}}})).to.eql(666);
  });

  it("sets values", function() {
    let o = {x: {y: {z: 123}}};
    xyz(o, 999);
    expect(o.x.y.z).to.eql(999);
  });

  it("sets values even if path doesnt exist yet", function() {
    let o = {} as any;
    xyz(o, 789);
    expect(o.x.y.z).to.eql(789);
  });
});
