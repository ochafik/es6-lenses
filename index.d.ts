export declare function selector(f: (_: any) => any): string[];

export interface Lens<T, V> {
    (target: T): V | undefined;
    (target: T, value: V): V;
}
export declare function lens<T, V>(f: (_: T) => V): Lens<T, V>;
export declare function makeLens<T, V>(properties: string[]): Lens<T, V>;
