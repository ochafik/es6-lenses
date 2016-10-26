/// <reference path="../node_modules/immutable/dist/immutable.d.ts" />

declare function require(path: string): any;

let _Immutable: typeof Immutable;
let _searchedForImmutable = false;
function getImmutable(): typeof Immutable {
  if (!_searchedForImmutable) {
    _searchedForImmutable = true;
    if (typeof Immutable !== 'undefined') {
      _Immutable = Immutable;
    } else if (typeof require !== 'undefined') {
      try {
        _Immutable = require('immutable');
      } catch (_) {
        // Do nothing.
      }
    }
  }
  return _Immutable;
}

export function isImmutableMap(x: any): x is Immutable.Map<any, any> {
  const Immutable = getImmutable();
  return Immutable && x instanceof Immutable.Map;
}

export function isEqual(a: any, b: any): boolean {
  const Immutable = getImmutable();
  if (Immutable) {
    return Immutable.is(a, b);
  } else {
    return Object.is(a, b);
  }
}

export function deepCloneWithUpdate<T>(
    target: T,
    keyPath: PropertyKey[],
    value: any,
    clones: (Map<any, any> | null) = null): T {

  if (keyPath.length === 0) {
    return value;
  }
  let [firstKey, ...subKeyPath] = keyPath;

  if (target == null) {
    const clone = Object.create(null);
    clone[firstKey] = deepCloneWithUpdate(clone, subKeyPath, value, clones);
    return clone;
  } else if (isImmutableMap(target)) {
    return target.setIn(keyPath, value) as any as T;
  } else {
    const existingValue = (target as any)[firstKey];
    if (isEqual(existingValue, value)) {
      return target;
    }
    if (clones != null) {
      const existingClone = clones.get(target);
      if (existingClone != null) {
        return existingClone;
      }
    }
    const clone = Object.create(Object.getPrototypeOf(target));
    if (clones == null) {
      clones = new Map<any, any>();
    }
    clones.set(target, clone);
    const subClone = deepCloneWithUpdate(existingValue, subKeyPath, value, clones);
    if (isEqual(subClone, existingValue)) {
      return target;
    }
    
    let found = false;
    for (const key of [...Object.getOwnPropertyNames(target), ...Object.getOwnPropertySymbols(target)]) {
      let desc = Object.getOwnPropertyDescriptor(target, key);
      if (key === firstKey) {
        if (!('value' in desc)) {
          throw new Error(`Descriptor for property ${firstKey} has no value: ${JSON.stringify(desc)}`);
        }
        desc.value = subClone;
        found = true;
      }
      Object.defineProperty(clone, key, desc);
    }
    if (!found) {
      clone[firstKey] = subClone;
    }
    return clone;
  }
}

export function getOrSetEmpty(x: any, key: PropertyKey): any {
  let value = x[key];
  if (value == null) {
    x[key] = value = Object.create(null);
  }
  return value;
}
