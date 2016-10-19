import {AbstractProxyHandler} from './abstract_proxy_handler';

export interface Lens<T, V> {
  // Getter
  (target: T): V;
  // Setter
  (target: T, value: V): V;
}

const propertiesSymbol = Symbol('properties');
const unspecifiedValue: any = {};

class SelectorProxyHandler extends AbstractProxyHandler<PropertyKey[]> {
  get(properties: PropertyKey[], p: PropertyKey, receiver: any): any {
    if (p === propertiesSymbol) return properties;
    return new Proxy<PropertyKey[]>(properties.concat(p), this);
  }
}

const rootSelector = new Proxy<PropertyKey[]>([], new SelectorProxyHandler());

export function lens<T, V>(f: (_: T) => V): Lens<T, V> {
  const selector = f(rootSelector as any) as any;
  const properties: string[] = selector[propertiesSymbol];

  const propertiesButLast = properties.slice(0, -1);
  const lastProperty = properties[properties.length - 1];

  return function(target: T, value: V = unspecifiedValue): any {
    if (value === unspecifiedValue) {
      return properties.reduce((x, n) => x && x[n], target);
    } else {
      return propertiesButLast.reduce(getOrSetEmpty, target)[lastProperty] = value;
    }
  } as Lens<T, V>;
}

function getOrSetEmpty(x: any, key: PropertyKey): any {
  let value = x[key];
  if (value == null) {
    x[key] = value = Object.create(null);
  }
  return value;
}
