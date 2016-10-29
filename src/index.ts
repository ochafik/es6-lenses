import {ArrayLens} from './array_lens';
import {Callable, makeLensCallable} from './callable_lens';
import {Lens} from './lens';
import {_, getLens} from './lens_proxy_handler';
export {_} from './lens_proxy_handler';
import {ObjectLens} from './object_lens';

export function lens<T, V>(definition: (((target: T) => V) | {} | Array<any>)): Lens<T, V> & Callable<T, V> {
  const lens = getLens(definition);
  if (lens != null) {
    return makeLensCallable<T, V, any>(lens);
  }
  if (definition instanceof Function) {
    definition = definition(_);
  }
  return makeLensCallable<T, V, any>(composeLens<T, V>(definition));
}

function composeLens<T, V>(definition: any): Lens<T, V> {
  const lens = getLens(definition);
  if (lens != null) {
    return lens;
  } else if (definition instanceof Array) {
    return new ArrayLens<T, any>(definition.map(v => {
      return composeLens<T, any>(v);
    }));
  } else if (definition instanceof Object &&
      Object.getPrototypeOf(definition) === Object.prototype) {
    // Object literal?
    return new ObjectLens<T, any>(
        Object.keys(definition).map(k =>
          [k, composeLens<T, any>(definition[k])] as [PropertyKey, Lens<T, any>]));
  } else {
    throw new Error(`Invalid lens definition (${typeof definition})`);
  }
}
