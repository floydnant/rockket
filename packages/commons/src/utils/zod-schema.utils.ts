import { z } from 'zod'
import { MaskOf, ToString } from '.'
import { ExtractWithMask } from './object.utils'

export const objKeysToEnumSchema = <T extends Record<string, unknown>>(obj: T) => {
    return z.enum(Object.keys(obj).map(String) as [ToString<keyof T>, ...ToString<keyof T>[]])
}

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

export const pickFromZodNativeEnum = <TEnumObj extends Record<string, string>, TKeys extends keyof TEnumObj>(
    zodNativeEnumSchema: z.ZodNativeEnum<TEnumObj>,
    keys: TKeys[],
): z.ZodNativeEnum<Pick<TEnumObj, TKeys>> => {
    return z.nativeEnum(pickFromObj(zodNativeEnumSchema.enum, keys))
}