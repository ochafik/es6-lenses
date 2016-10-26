const propertiesSymbol = Symbol('properties');

interface ISelector {
  properties: PropertyKey[];
  children?: {[key: string]: (ISelector|undefined)};
}

class SelectorProxyHandler implements ProxyHandler<ISelector> {
  has(target: ISelector, p: PropertyKey): boolean {
    return p === propertiesSymbol;
  }
  get(target: ISelector, p: PropertyKey, receiver: any): any {
    if (p === propertiesSymbol) {
      return target.properties;
    }
    if (p === Symbol.iterator) {
      let i = 0;
      // tslint:disable-next-line
      return (function*() {
        while (true) {
          // console.log("Returning new at i = " + i)
          yield new Proxy<ISelector>({properties: target.properties.concat(i++)}, this);
        }
      }).bind(this);
    }
    return new Proxy<ISelector>({properties: target.properties.concat(p)}, this);
  }
}

let rootSelector: ProxyHandler<ISelector>;
function getRootSelector(): any {
  if (rootSelector == null) {
     rootSelector = new Proxy<ISelector>({properties: []}, new SelectorProxyHandler());
  }
  return rootSelector;
}

export function selector(f: (_: any) => any): string[] {
  const result = f(getRootSelector()) as any;
  if (!(propertiesSymbol in result)) {
    throw new Error(`Invalid selector result: ${result}`);
  }
  const properties: string[] = result[propertiesSymbol];
  return properties;
}
