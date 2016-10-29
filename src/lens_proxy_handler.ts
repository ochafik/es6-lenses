import {Lens} from './lens';
import {PathLens} from './path_lens';

const lensSymbol = Symbol('lens');

export function getLens(target: any): (Lens<any, any> | null) {
  // if (target == null) return null;
  return lensSymbol in target ? target[lensSymbol] as Lens<any, any> : null;
}

type ProxyTarget = Function & {
  path: PropertyKey[];
};

function makeProxyTarget(path: PropertyKey[]): ProxyTarget {
  // tslint:disable-next-line
  const target: ProxyTarget = function() {} as any;
  target.path = path;
  return target;
}

export function wrapPathWithProxy(path: PropertyKey[]): any {
  return new Proxy<ProxyTarget>(makeProxyTarget(path), lensProxyHandler);
}

const lensProxyHandler: ProxyHandler<ProxyTarget> = new class {
  set(target: ProxyTarget, p: PropertyKey, value: any, receiver: any): boolean {
    throw new Error('Cannot set on a lens');
  }
  deleteProperty(target: ProxyTarget, p: PropertyKey): boolean {
    throw new Error('Cannot deleteProperty on a lens');
  }
    
  isExtensible(target: ProxyTarget): boolean {
    return false;
  }
  preventExtensions(target: ProxyTarget): boolean {
    return true;
  }
  has(target: ProxyTarget, p: PropertyKey): boolean {
    return p === lensSymbol;
  }
  get(target: ProxyTarget, p: PropertyKey, receiver: any): any {
    if (p === lensSymbol) {
      return new PathLens(target.path);
    } else if (p === Symbol.iterator) {
      let i = 0;
      // tslint:disable-next-line
      return (function*() {
        while (true) {
          yield wrapPathWithProxy(target.path.concat(i++));
        }
      });
    } else {
      return wrapPathWithProxy(target.path.concat(p));
    }
  }

  apply(target: ProxyTarget, thisArg: any, argArray?: any): any {
    const obj = argArray[0]; 
    return new PathLens(target.path).get(obj);
  }
};

export const _ = wrapPathWithProxy([]);