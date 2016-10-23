export interface Lens<T, V> {
    (target: T): V | undefined;
    (target: T, value: V): T;
    update(target: T, f: (value: V) => V): T;
}

// export interface Lenses {
//   lens<A, V>(f: (_: A) => V): Lens<A, V>;
//   lens<A, B, V>(f: (_1: A, _2: B) => V): Lens<[A, B], V>;
//   lens<A, B, C, V>(f: (_1: A, _2: B, _3: C) => V): Lens<[A, B, C], V>;
// }
