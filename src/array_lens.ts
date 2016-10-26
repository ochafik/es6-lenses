import {Lens} from './lens';

export class ArrayLens<T, V extends Array<any>> extends Lens<T, V> {
  constructor(
      // public readonly f: (target: T) => V,
      public readonly lenses: Lens<T, any>[]) {
    super();
  }
  toString() {
    return '[' + this.lenses.map(l => l.toString()).join(', ') + ']';
  }

  get(target: T): V {
    return this.lenses.map(lens => lens.get(target)) as V;
  }
  mutate(target: T, value: V): T {
    this.lenses.forEach((lens, i) => {
      lens.mutate(target, value[i]);
    });
    return target;
  }
  set(target: T, value: V): T {
    if (value == null || value.length !== this.lenses.length) {
      throw new Error(`Invalid value, expected array of length ${this.lenses.length}, got ${value}`);
    }
    let result = target;
    this.lenses.forEach((lens, i) => {
      result = lens.set(result, value[i]);
    });
    return result;
  }
  after<A>(prefix: Lens<A, T>): Lens<A, V> {
    return new ArrayLens<A, V>(
        this.lenses.map(sub => sub.after(prefix)));
  }
}
