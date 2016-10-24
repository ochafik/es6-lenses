export declare abstract class Lens<T, V> {
    abstract get(target: T): V | undefined;
    abstract mutate(target: T, value: V): void;
    abstract update(target: T, value: V): T;
    andThen<W>(lens: Lens<V, W>): Lens<T, W>;
    abstract after<A>(prefix: Lens<A, T>): Lens<A, V>;
}
export declare function lens<T, V>(f: (target: T) => V): Lens<T, V>;
