import {ArrayLens} from './array_lens';
import {Callable, makeLensCallable} from './callable_lens';
import {Lens} from './lens';
import {_, getLens} from './lens_proxy_handler';
export {_} from './lens_proxy_handler';
import {ObjectLens} from './object_lens';

export function lens<T, V>(f: (((target: T) => V) | {} | Array<any>)): Lens<T, V> & Callable<T, V> {
  const lens = getLens(f);
  if (lens != null) {
    return makeLensCallable<T, V, any>(lens);
  }
  if (f instanceof Function) {
    f = f(_);
  }
  return makeLensCallable<T, V, any>(composeLens<T, V>(f));
}

function composeLens<T, V>(result: any): Lens<T, V> {
  const lens = getLens(result);
  if (lens != null) {
    return lens;
  } else if (result instanceof Array) {
    return new ArrayLens<T, any>(result.map(v => {
      return composeLens<T, any>(v);
    }));
  } else if (result instanceof Object && Object.getPrototypeOf(result) === Object.prototype) {
    // Object literal?
    return new ObjectLens<T, any>(
        Object.keys(result).map(k =>
          [k, composeLens<T, any>(result[k])] as [PropertyKey, Lens<T, any>]));
  } else {
    throw new Error(`Invalid lens result (${typeof result})`);
  }
}
