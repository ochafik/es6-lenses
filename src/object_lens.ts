import {Lens} from './lens';

export class ObjectLens<T, V extends Object> extends Lens<T, V> {
  constructor(
      // public readonly f: (target: T) => V,
      public readonly lenses: [PropertyKey, Lens<T, any>][]) {
    super();
  }
  toString() {
    return '{' + this.lenses.map(([k, l]) => `${k}: ${l.toString()}`).join(', ') + '}';
  }

  get(target: T): V {
    const result = Object.create(null);
    for (const [key, lens] of this.lenses) {
      result[key] = lens.get(target);
    }
    return result as V;
  }
  mutate(target: T, value: V): T {
    for (const [key, lens] of this.lenses) {
      lens.mutate(target, (value as any)[key]);
    }
    return target;
  }
  update(target: T, value: V): T {
    let result = target;
    for (const [key, lens] of this.lenses) {
      result = lens.update(result, (value as any)[key]);
    }
    return result;
  }
  after<A>(prefix: Lens<A, T>): Lens<A, V> {
    return new ObjectLens<A, V>(
        this.lenses.map(([k, sub]) =>
            [k, sub.after(prefix)] as [PropertyKey, Lens<A, any>]));
  }
}
