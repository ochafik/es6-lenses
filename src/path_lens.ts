import {ArrayLens} from './array_lens';
import {Lens} from './lens';
import {getLens, wrapPathWithProxy} from './lens_proxy_handler';
import {ObjectLens} from './object_lens';
import {deepCloneWithUpdate, getOrSetEmpty, isImmutableMap} from './utils';

export class PathLens<T, V> extends Lens<T, V> {
  constructor(
      public readonly path: ReadonlyArray<PropertyKey>) {
    super();
  }
  toString() {
    return '_.' + this.path.join('.');
  }

  get(target: T): V {
    const targetPath = getLens(target);
    if (targetPath instanceof PathLens) {
      return wrapPathWithProxy(targetPath.path.concat(this.path));
    }
    if (isImmutableMap(target)) {
      return target.getIn(this.path as PropertyKey[]) as V;
    }
    return this.path.reduce(
        (x: any, n: PropertyKey) => x != null && typeof x === 'object' ? x[n] : undefined,
        target);
  }
  mutate(target: T, value: V): T {
    if (isImmutableMap(target)) {
      throw new Error('Cannot mutate an Immutable object');
    }
    const propertiesButLast = this.path.slice(0, -1);
    const lastProperty = this.path[this.path.length - 1];

    let lastTarget = propertiesButLast.reduce(getOrSetEmpty, target);
    lastTarget[lastProperty] = value;
    return target;
  }
  set(target: T, value: V): T {
    return deepCloneWithUpdate<T>(target, this.path, value);
  }
  update(target: T, f: (value: V | undefined) => (V | undefined)): T {
    if (isImmutableMap(target)) {
      return target.updateIn(this.path as PropertyKey[], f) as any as T;
    }
    return super.update(target, f);
  }
  after<A>(prefix: Lens<A, T>): Lens<A, V> {
    if (this.path.length === 0) {
      return prefix as any;
    }
    if (prefix instanceof PathLens) {
      return new PathLens<A, V>(prefix.path.concat(this.path));
    } else {
      let [first, ...others] = this.path;
      if (prefix instanceof ObjectLens) {
        let [namedSel] = prefix.lenses.filter(([k, ]) => k === first);
        if (namedSel == null) {
          throw new Error(`No such path in ${prefix.toString()}: ${first} (to prepend to ${this.toString()})`);
        }
        let [, sel] = namedSel;
        return sel.andThen(new PathLens<any, any>(others));
      } else if (prefix instanceof ArrayLens) {
        let sel = prefix.lenses[first as any];
        if (sel == null) {
          throw new Error(`No such index in ${prefix.toString()}: ${first} (to prepend to ${this.toString()})`);
        }
        return sel.andThen(new PathLens<any, any>(others));
      }
      throw 'unsupported';
    }
  }
}
