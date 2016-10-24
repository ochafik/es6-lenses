/// <reference path="../node_modules/immutable/dist/immutable.d.ts" />

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
  } else if (typeof Immutable !== 'undefined' && target instanceof Immutable.Map) {
    let map = target as any as Immutable.Map<any, any>;
    return map.setIn(keyPath, value) as any as T;
  } else {
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
    const subClone = deepCloneWithUpdate(clone[firstKey], subKeyPath, value, clones);

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
