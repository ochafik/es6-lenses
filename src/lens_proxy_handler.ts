import {Lens} from './lens';
import {PathLens} from './path_lens';

const lensSymbol = Symbol('lens');

export function getLens(target: any): (Lens<any, any> | null) {
  return lensSymbol in target ? target[lensSymbol] as Lens<any, any> : null;
}

class LensProxyHandler implements ProxyHandler<PathLens<any, any>> {
  has(target: PathLens<any, any>, p: PropertyKey): boolean {
    return p === lensSymbol;
  }
  get(target: PathLens<any, any>, p: PropertyKey, receiver: any): any {
    if (p === lensSymbol) {
      return target;
    }
    if (p === Symbol.iterator) {
      let i = 0;
      // tslint:disable-next-line
      return (function*() {
        while (true) {
          // console.log("Returning new at i = " + i)
          yield new Proxy<PathLens<any, any>>(new PathLens(target.path.concat(i++)), this);
        }
      }).bind(this);
    }
    return new Proxy<PathLens<any, any>>(
      new PathLens(target.path.concat(p)), this);
  }
}

let rootLens: ProxyHandler<PathLens<any, any>>;
export function getRootLens(): any {
  if (rootLens == null) {
     rootLens = new Proxy<PathLens<any, any>>(new PathLens([]), new LensProxyHandler());
  }
  return rootLens;
}
