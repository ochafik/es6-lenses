export abstract class Lens<T, V> {
  // TODO(ochafik): compile(): Lens<T, V>; // eval / Function(string)-based.
  abstract get(target: T): V | undefined;
  abstract mutate(target: T, value: V): void;
  abstract update(target: T, value: V): T;
  andThen<W>(lens: Lens<V, W>): Lens<T, W> {
    if (lens == null) {
      throw 'null after';
    }
    return lens.after(this);
  }
  abstract after<A>(prefix: Lens<A, T>): Lens<A, V>;
}

export function updater<T, V>(lens: Lens<T, V>, f: (value: V | undefined) => V): (target: T) => T {
  return (target: T): T => lens.update(target, f(lens.get(target)));
}
