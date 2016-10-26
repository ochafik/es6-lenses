export declare abstract class Lens<T, V> {
    get(target: T): V | undefined;
    mutate(target: T, value: V): void;
    set(target: T, value: V): T;
    update(target: T, f: (value: V | undefined) => (V | undefined)): T;
    andThen<W>(lens: Lens<V, W>): Lens<T, W>;
    after<A>(prefix: Lens<A, T>): Lens<A, V>;
}
export declare function lens<T, V>(f: (target: T) => V): Lens<T, V>;

export declare const _: any;