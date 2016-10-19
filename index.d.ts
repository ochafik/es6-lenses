export interface Lens<T, V> {
    apply(target: T): V;
    apply(target: T, value: V): V;
}
export declare function lens<T, V>(f: (_: T) => V): Lens<T, V>;
export declare function makeLens<T, V>(properties: string[]): Lens<T, V>;
