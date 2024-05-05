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

export type ValueOf<T extends object> = T[keyof T]

export type EntryOf<T extends object> = {
    [K in keyof T]: [K, T[K]]
}[keyof T]

export type Mapped<T> = {
    [K in keyof T]: T[K]
}

export type MaskOf<T> = {
    [K in keyof T]: true
}
export type PartialMaskOf<T> = Partial<MaskOf<T>>

export const keysOf = <TObj extends Record<string, unknown>>(obj: TObj): (keyof TObj)[] => {
    return Object.keys(obj)
}
export const valuesOf = <TObj extends Record<string, unknown>>(obj: TObj): ValueOf<TObj>[] => {
    return Object.values(obj) as ValueOf<TObj>[]
}
export const entriesOf = <TObj extends Record<string, unknown>>(obj: TObj): EntryOf<TObj>[] => {
    return Object.entries(obj) as EntryOf<TObj>[]
}

// prettier-ignore
export type ExtractWithMask<
    TObj extends Record<string, string>,
    TMask extends Partial<MaskOf<TObj>>
> = Pick<TObj, Extract<keyof TObj, ToString<keyof TMask>>>

export const extractFromObj = <TObj extends Record<string, string>, TMask extends Partial<MaskOf<TObj>>>(
    obj: TObj,
    mask: TMask,
): ExtractWithMask<TObj, TMask> => {
    const newEnumObj = {} as TObj
    for (const maskKey in mask) {
        if (maskKey in obj) newEnumObj[maskKey] = obj[maskKey]
    }

    return newEnumObj as ExtractWithMask<TObj, TMask>
}

export const pickFromObj = <TObj extends Record<string, string>, TKeys extends keyof TObj>(
    obj: TObj,
    keys: TKeys[],
): Pick<TObj, TKeys> => {
    const newEnumObj = {} as Pick<TObj, TKeys>
    for (const key of keys) {
        if (key in obj) newEnumObj[key] = obj[key]
    }

    return newEnumObj
}
