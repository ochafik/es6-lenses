import {expect} from 'chai';

export function expectImmutable(a: any) {
  return {
    to: {
      eql(b: any) {
        if (a == null || b == null) {
          expect(a).is.eql(b);
        } else if (!a.equals(b)) {
          expect.fail(a.toString(), b.toString());
        }
      }
    }
  }
}
