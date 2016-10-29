export interface Lens<T, V> {
    // A lens is usable directly as a getter function.
    (target: T): V | undefined;
    get(target: T): V | undefined;

    set(target: T, value: V): T;
    update(target: T, f: (value: V | undefined) => (V | undefined)): T;
    
    mutate(target: T, value: V): void;
    
    andThen<W>(lens: Lens<V, W>): Lens<T, W>;
    after<A>(prefix: Lens<A, T>): Lens<A, V>;
}
export declare function lens<T, V>(f: (target: T) => V): Lens<T, V>;

export declare const _: any;