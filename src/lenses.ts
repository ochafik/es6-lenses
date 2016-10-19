import selector from './selector';

const unspecifiedValue: any = {};

export interface Lens<T, V> {
    apply(target: T): V;
    apply(target: T, value: V): V;
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
  return handler as Lens<T, V>;
}

function getOrSetEmpty(x: any, key: PropertyKey): any {
  let value = x[key];
  if (value == null) {
    x[key] = value = Object.create(null);
  }
  return value;
}
