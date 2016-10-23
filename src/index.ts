import {ArrayLens} from './array_lens';
import {Lens} from './lens';
import {getLens, getRootLens} from './lens_proxy_handler';
import {ObjectLens} from './object_lens';

export function lens<T, V>(f: (target: T) => V): Lens<T, V> {
  return composeLens<T, V>(f(getRootLens()));
}

function composeLens<T, V>(result: any): Lens<T, V> {
  const lens = getLens(result);
  if (lens != null) {
    return lens;
  }
  if (result instanceof Array) {
    return new ArrayLens<T, any>(result.map(v => composeLens<T, any>(v)));
  }
  // Object literal?
  if (result instanceof Object && Object.getPrototypeOf(result) === Object.prototype) {
    return new ObjectLens<T, any>(
        Object.keys(result).map(k =>
          [k, composeLens<T, any>(result[k])] as [PropertyKey, Lens<T, any>]));
  }
  throw new Error(`Invalid lens result (${typeof result})`);
}
