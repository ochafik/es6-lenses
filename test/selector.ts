import {selector} from "../src/selector";
import {expect} from 'chai';

describe("selector", () => {
  it("returns valid property paths", () => {
    expect(selector(_ => _)).to.eql([]);
    expect(selector(_ => _.x)).to.eql(['x']);
    expect(selector(_ => _.x.y)).to.eql(['x', 'y']);
    expect(selector(_ => _.x.y.z)).to.eql(['x', 'y', 'z']);
  });
  it("throws when given invalid function", () => {
    expect(() => selector(_ => {})).to.throw(Error); // tslint:disable-line
    expect(() => selector(_ => 1)).to.throw(Error);
    expect(() => selector(_ => null)).to.throw(Error);
  });
});
