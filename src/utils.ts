export function deepCloneWithUpdate<T>(
    target: T, path: PropertyKey[],
    value: any,
    clones: (Map<any, any> | null) = null): T {

  if (path.length === 0) {
    return value;
  }
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
      if (existingClone != null) {
        return existingClone;
      }
    }
    const clone = Object.create(Object.getPrototypeOf(target));
    if (clones == null) {
      clones = new Map<any, any>();
    }
    clones.set(target, clone);
    const subClone = deepCloneWithUpdate(clone[prop], subPath, value, clones);

    let found = false;
    for (const key of [...Object.getOwnPropertyNames(target), ...Object.getOwnPropertySymbols(target)]) {
      let desc = Object.getOwnPropertyDescriptor(target, key);
      if (key === prop) {
        if (!('value' in desc)) {
          throw new Error(`Descriptor for property ${prop} has no value: ${JSON.stringify(desc)}`);
        }
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

export function getOrSetEmpty(x: any, key: PropertyKey): any {
  let value = x[key];
  if (value == null) {
    x[key] = value = Object.create(null);
  }
  return value;
}
