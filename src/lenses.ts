import {AbstractProxyHandler} from './abstract_proxy_handler';

const propertiesSymbol = Symbol('properties');
const unspecifiedValue: any = {};

interface Selector {
  properties: PropertyKey[];
  children?: {[key: string]: (Selector|undefined)};
  isEnumerated?: boolean;
  // TODO(ochafik): Options on how to handle nested undefined, etc.
}

export class SelectorProxyHandler extends AbstractProxyHandler<Selector> {

  has(target: T, p: PropertyKey): boolean {
    return p === propertiesSymbol;
  }
  get(target: Selector, p: PropertyKey, receiver: any): any {
    if (p === propertiesSymbol) {
      return target.properties;
    }
    if (p === Symbol.iterator) {
      target.isEnumerated = true;
      let i = 0;
      return (function*() {
        while (true) {
          // console.log("Returning new at i = " + i)
          yield new Proxy<Selector>({properties: target.properties.concat(i++)}, this);
        }
      }).bind(this);
    }
    return new Proxy<Selector>({properties: target.properties.concat(p)}, this);
  }
}

const rootSelector = new Proxy<Selector>({properties: []}, new SelectorProxyHandler());

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
  const result = f(rootSelector as any) as any;
  if (!(propertiesSymbol in result)) {
    throw new Error(`Invalid lens result: ${result.toString()}`);
  }
  const properties: string[] = result[propertiesSymbol];
  return makeLens<T, V>(properties);
}

export function makeLens<T, V>(properties: string[]): Lens<T, V> {
  const propertiesButLast = properties.slice(0, -1);
  const lastProperty = properties[properties.length - 1];

  function handler(target: T, value: V = unspecifiedValue): any {
    if (value === unspecifiedValue) {
      // Getter
      return properties.reduce((x, n) => typeof x === 'object' ? x[n] : undefined, target);
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
