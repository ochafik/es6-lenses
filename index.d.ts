export declare function selector(f: (_: any) => any): string[];

export interface Lens<T, V> {
    (target: T): V | undefined;
    (target: T, value: V): T;
}
export declare function lens<T, V>(path: ((_: T) => V) | PropertyKey[]): Lens<T, V>;
export declare function mutatingLens<T, V>(path: ((_: T) => V) | PropertyKey[]): Lens<T, V>;
