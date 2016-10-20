import {Lens} from './lens';
import {selector} from './selector';

const unspecifiedValue: any = {};

export function mutatingLens<T, V>(path: ((_: T) => V) | PropertyKey[]): Lens<T, V> {
  return makeMutatingLens<T, V>(path instanceof Array ? path : selector(path));
}

function makeMutatingLens<T, V>(properties: PropertyKey[]): Lens<T, V> {
  const propertiesButLast = properties.slice(0, -1);
  const lastProperty = properties[properties.length - 1];

  function handler(target: T, value: V = unspecifiedValue): any {
    if (value === unspecifiedValue) {
      // Getter
      return properties.reduce(
          (x: any, n: PropertyKey) => typeof x === 'object' ? x[n] : undefined,
          target);
    } else {
      // Setter
      let lastTarget = propertiesButLast.reduce(getOrSetEmpty, target);
      lastTarget[lastProperty] = value;
      return target;
    }
  };
  handler.toString = () => '_.' + properties.join('.');
  return handler as any;
}

function getOrSetEmpty(x: any, key: PropertyKey): any {
  let value = x[key];
  if (value == null) {
    x[key] = value = Object.create(null);
  }
  return value;
}
