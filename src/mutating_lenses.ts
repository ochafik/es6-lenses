import {selector} from './selector';
export {selector} from './selector';

const unspecifiedValue: any = {};

export interface MutatingLens<T, V> {
    (target: T): V | undefined;
    (target: T, value: V): V;
}

// export interface MutatingLenses {
//   lens<A, V>(f: (_: A) => V): Lens<A, V>;
//   lens<A, B, V>(f: (_1: A, _2: B) => V): Lens<[A, B], V>;
//   lens<A, B, C, V>(f: (_1: A, _2: B, _3: C) => V): Lens<[A, B, C], V>;
// }

export function mutatingLens<T, V>(f: (_: T) => V): MutatingLens<T, V> {
  return makeMutatingLens<T, V>(selector(f));
}

export function makeMutatingLens<T, V>(properties: string[]): MutatingLens<T, V> {
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
      return lastTarget[lastProperty] = value;
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
