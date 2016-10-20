import {selector} from './selector';

const unspecifiedValue: any = {};

export interface Lens<T, V> {
    (target: T): V | undefined;
    (target: T, value: V): T;
}

// export interface Lenses {
//   lens<A, V>(f: (_: A) => V): Lens<A, V>;
//   lens<A, B, V>(f: (_1: A, _2: B) => V): Lens<[A, B], V>;
//   lens<A, B, C, V>(f: (_1: A, _2: B, _3: C) => V): Lens<[A, B, C], V>;
// }

export function lens<T, V>(f: (_: T) => V): Lens<T, V> {
  return makeLens<T, V>(selector(f));
}

export function makeLens<T, V>(properties: string[]): Lens<T, V> {
  const lastProperty = properties[properties.length - 1];

  function handler(target: T, value: V = unspecifiedValue): any {
    if (value === unspecifiedValue) {
      return properties.reduce(
          (x: any, n: PropertyKey) => typeof x === 'object' ? x[n] : undefined,
          target);
    } else {
      return deepCloneWithUpdate<T>(target, properties, value);
    }
  };
  handler.toString = () => '_.' + properties.join('.');
  return handler as Lens<T, V>;
}

function deepCloneWithUpdate<T>(target: T, path: string[], value: any, clones: (Map<any, any> | null) = null): T {
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
