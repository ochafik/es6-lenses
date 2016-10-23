const lensSymbol = Symbol('properties');

export abstract class Lens<T, V> {
  // TODO(ochafik): compile(): Lens<T, V>; // eval / Function(string)-based.
  abstract get(target: T): V | undefined;
  abstract mutate(target: T, value: V): void;
  abstract update(target: T, value: V): T;
  andThen<W>(lens: Lens<V, W>): Lens<T, W> {
    if (lens == null) throw 'null after';
    return lens.after(this);
  }
  // abstract andThen<W>(lens: Lens<V, W>): Lens<T, W>;
  // abstract mapPaths<A>(f: (path: PathLens<T>) =>
  abstract after<A>(prefix: Lens<A, T>): Lens<A, V>;
  // abstract andThen(key: PropertyKey): Lens<T, any>;
}

export function updater<T, V>(lens: Lens<T, V>, f: (value: V | undefined) => V): (target: T) => T {
  return function(target: T): T {
    return lens.update(target, f(lens.get(target)));
  };
}

class PathLens<T, V> extends Lens<T, V> {
  constructor(
      public readonly path: PropertyKey[]) {
    super();
  }
  toString() {
    return '_.' + this.path.join('.');
  }

  get(target: T): V {
    return this.path.reduce(
        (x: any, n: PropertyKey) => typeof x === 'object' ? x[n] : undefined,
        target);
  }
  mutate(target: T, value: V): T {
    const propertiesButLast = this.path.slice(0, -1);
    const lastProperty = this.path[this.path.length - 1];

    let lastTarget = propertiesButLast.reduce(getOrSetEmpty, target);
    lastTarget[lastProperty] = value;
    return target;
  }
  update(target: T, value: V): T {
    return deepCloneWithUpdate<T>(target, this.path, value);
  }
  after<A>(prefix: Lens<A, T>): Lens<A, V> {
    if (this.path.length == 0) {
      return prefix as any;
    }
    if (prefix instanceof PathLens) {
      return new PathLens<A, V>(prefix.path.concat(this.path));
    } else {
      let [first, ...others] = this.path;
      if (prefix instanceof ObjectCompositeLens) {
        let [namedSel] = prefix.lenses.filter(([k,]) => k == first);
        if (namedSel == null) throw new Error(`No such path in ${prefix.toString()}: ${first} (to prepend to ${this.toString()})`);
        // throw `${sel.toString()} -> ${others}`
        let [, sel] = namedSel;
        return sel.andThen(new PathLens<any, any>(others));
      } else if (prefix instanceof ArrayCompositeLens) {
        let sel = prefix.lenses[first as any];
        if (sel == null) throw new Error(`No such index in ${prefix.toString()}: ${first} (to prepend to ${this.toString()})`);
        return sel.andThen(new PathLens<any, any>(others));
      }
      throw 'unsupported';
    }
  }
}

class ObjectCompositeLens<T, V extends Object> extends Lens<T, V> {
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
    return new ObjectCompositeLens<A, V>(
        this.lenses.map(([k, sub]) =>
            [k, sub.after(prefix)] as [PropertyKey, Lens<A, any>]));
  }
}

class ArrayCompositeLens<T, V extends Array<any>> extends Lens<T, V> {
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
  update(target: T, value: V): T {
    if (value == null || value.length != this.lenses.length) {
      throw new Error(`Invalid value, expected array of length ${this.lenses.length}, got ${value}`);
    }
    let result = target;
    this.lenses.forEach((lens, i) => {
      result = lens.update(result, value[i]);
    });
    return result;
  }
  after<A>(prefix: Lens<A, T>): Lens<A, V> {
    return new ArrayCompositeLens<A, V>(
        this.lenses.map(sub => sub.after(prefix)));
  }
}

class LensProxyHandler implements ProxyHandler<PathLens<any, any>> {
  has(target: PathLens<any, any>, p: PropertyKey): boolean {
    return p === lensSymbol;
  }
  get(target: PathLens<any, any>, p: PropertyKey, receiver: any): any {
    if (p === lensSymbol) {
      return target;
    }
    if (p === Symbol.iterator) {
      let i = 0;
      return (function*() {
        while (true) {
          // console.log("Returning new at i = " + i)
          yield new Proxy<PathLens<any, any>>(new PathLens(target.path.concat(i++)), this);
        }
      }).bind(this);
    }
    return new Proxy<PathLens<any, any>>(
      new PathLens(target.path.concat(p)), this);
  }
}

let rootLens: ProxyHandler<PathLens<any, any>>;
function getRootLens(): any {
  if (rootLens == null) {
     rootLens = new Proxy<PathLens<any, any>>(new PathLens([]), new LensProxyHandler());
  }
  return rootLens;
}

export function lens<T, V>(f: (target: T) => V): Lens<T, V> {
  return composeLens<T, V>(f(getRootLens()));
}

function composeLens<T, V>(result: any): Lens<T, V> {
  if (lensSymbol in result) {
    return result[lensSymbol] as Lens<T, V>;
  }
  if (result instanceof Array) {
    return new ArrayCompositeLens<T, any>(result.map(v => composeLens<T, any>(v)));
  }
  // Object literal?
  if (result instanceof Object && Object.getPrototypeOf(result) === Object.prototype) {
    return new ObjectCompositeLens<T, any>(
        Object.keys(result).map(k =>
          [k, composeLens<T, any>(result[k])] as [PropertyKey, Lens<T, any>]));
  }
  throw new Error(`Invalid lens result (${typeof result})`);
}

function deepCloneWithUpdate<T>(target: T, path: PropertyKey[], value: any, clones: (Map<any, any> | null) = null): T {
  if (path.length == 0) return value;
  let [prop, ...subPath] = path;

  if (target == null) {
    const clone = Object.create(null);
    clone[prop] = deepCloneWithUpdate(clone, subPath, value, clones);
    return clone;
  // } else if (target instanceof Immutable.Map) {
  // TODO
  } else {
    if (clones != null) {
      const existingClone = clones.get(target);
      if (existingClone != null) return existingClone;
    }
    const clone = Object.create(Object.getPrototypeOf(target));
    if (clones == null) clones = new Map<any, any>();
    clones.set(target, clone);
    const subClone = deepCloneWithUpdate(clone[prop], subPath, value, clones);

    let found = false;
    for (const key of [...Object.getOwnPropertyNames(target), ...Object.getOwnPropertySymbols(target)]) {
      let desc = Object.getOwnPropertyDescriptor(target, key);
      if (key == prop) {
        if (!('value' in desc)) throw new Error(`Descriptor for property ${prop} has no value: ${JSON.stringify(desc)}`);
        desc.value = subClone;
        found = true;
      }
      Object.defineProperty(clone, key, desc);
    }
    if (!found) {
      clone[prop] = subClone;
    }
    return clone;
  }
}

function getOrSetEmpty(x: any, key: PropertyKey): any {
  let value = x[key];
  if (value == null) {
    x[key] = value = Object.create(null);
  }
  return value;
}
