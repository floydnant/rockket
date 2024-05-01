import { z } from 'zod'
import { ToString } from '.'
import { pickFromObj } from './object.utils'

export const objKeysToEnumSchema = <T extends Record<string, unknown>>(obj: T) => {
    return z.enum(Object.keys(obj).map(String) as [ToString<keyof T>, ...ToString<keyof T>[]])
}

export const pickFromZodNativeEnum = <TEnumObj extends Record<string, string>, TKeys extends keyof TEnumObj>(
    zodNativeEnumSchema: z.ZodNativeEnum<TEnumObj>,
    keys: TKeys[],
): z.ZodNativeEnum<Pick<TEnumObj, TKeys>> => {
    return z.nativeEnum(pickFromObj(zodNativeEnumSchema.enum, keys))
}