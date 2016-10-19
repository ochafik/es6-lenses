import {expect} from 'chai';
import selector from "../src/selector";

describe("selector", function() {
  it("returns valid property paths", function() {
    expect(selector(_ => _)).to.eql([]);
    expect(selector(_ => _.x)).to.eql(['x']);
    expect(selector(_ => _.x.y)).to.eql(['x', 'y']);
    expect(selector(_ => _.x.y.z)).to.eql(['x', 'y', 'z']);
  });
  it("throws when given invalid function", function() {
    expect(() => selector(_ => {})).to.throw(Error);
    expect(() => selector(_ => 1)).to.throw(Error);
    expect(() => selector(_ => null)).to.throw(Error);
  });
});
