export abstract class Lens<T, V> {
  // TODO(ochafik): compile(): Lens<T, V>; // eval / Function(string)-based.
  abstract get(target: T): V | undefined;
  abstract set(target: T, value: (V | undefined)): T;
  update(target: T, f: (value: V | undefined) => (V | undefined)): T {
    return this.set(target, f(this.get(target)));
  }
  abstract mutate(target: T, value: V): void;

  andThen<W>(lens: Lens<V, W>): Lens<T, W> {
    if (lens == null) {
      throw 'null after';
    }
    return lens.after(this);
  }
  abstract after<A>(prefix: Lens<A, T>): Lens<A, V>;
}
