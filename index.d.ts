export declare function selector(f: (_: any) => any): string[];

export interface Lens<T, V> {
    (target: T): V | undefined;
    (target: T, value: V): T;
}
export declare function lens<T, V>(f: (_: T) => V): Lens<T, V>;
export declare function makeLens<T, V>(properties: string[]): Lens<T, V>;

export interface MutatingLens<T, V> {
    (target: T): V | undefined;
    (target: T, value: V): V;
}
export declare function mutatingLens<T, V>(f: (_: T) => V): MutatingLens<T, V>;
export declare function makeMutatingLens<T, V>(properties: string[]): MutatingLens<T, V>;
