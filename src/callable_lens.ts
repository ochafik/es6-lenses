import {Lens} from './lens';

export type Callable<T, V> = {(target: T): V | undefined};

export function makeLensCallable<T, V, L extends Lens<T, V>>(lens: L): L & Callable<T, V> {
  // tslint:disable-next-line
  let callable: Callable<T, V> = function(this: L, target: T): V | undefined {
    return this.get(target);
  };
  callable = Object.setPrototypeOf(callable, lens);

  return Function.prototype.bind.call(callable, callable);
}
