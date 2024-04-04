import { ToString } from './string.utils'

/**
 * Combines all properties from the given union elements into a single object.
 *
 * @example
 * type Union = { a: string } | { b: number };
 * type Combined = CombineObjectUnion<Union>;
 * //     ^? { a: string; b: number }
 *
 * // This is especially useful when wanting to get the keys of all the objects in a union.
 * type UnionKeys = keyof Union;
 * //    ^? never
 * type CombinedKeys = keyof Combined;
 * //    ^? 'a' | 'b'
 */
export type CombineObjectUnion<T> = {
    [K in T extends infer P ? keyof P : never]: T extends infer P ? (K extends keyof P ? P[K] : never) : never
}

export type PrefixKeys<T extends object, TPrefix extends string> = {
    [K in keyof T as `${TPrefix}${ToString<K>}`]: T[K]
}

export type ValuesOf<T extends object> = T[keyof T]

export type EntriesOf<T extends object> = [keyof T, T[keyof T]][]

export type Mapped<T> = {
    [K in keyof T]: T[K]
}

export type MaskOf<T> = {
    [K in keyof T]: true
}
export type PartialMaskOf<T> = Partial<MaskOf<T>>
