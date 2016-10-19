import {AbstractProxyHandler} from './abstract_proxy_handler';

const propertiesSymbol = Symbol('properties');
const unspecifiedValue: any = {};

interface Selector {
  properties: PropertyKey[];
  children?: {[key: string]: (Selector|undefined)};
}

export class SelectorProxyHandler extends AbstractProxyHandler<Selector> {
  has(target: Selector, p: PropertyKey): boolean {
    return p === propertiesSymbol;
  }
  get(target: Selector, p: PropertyKey, receiver: any): any {
    if (p === propertiesSymbol) {
      return target.properties;
    }
    if (p === Symbol.iterator) {
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

let rootSelector: ProxyHandler<Selector>;
function getRootSelector(): any {
  if (rootSelector == null) {
     rootSelector = new Proxy<Selector>({properties: []}, new SelectorProxyHandler());
  }
  return rootSelector;
}

export default function(f: (_: any) => any): string[] {
  const result = f(getRootSelector()) as any;
  if (!(propertiesSymbol in result)) {
    throw new Error(`Invalid selector result: ${result}`);
  }
  const properties: string[] = result[propertiesSymbol];
  return properties;
}
