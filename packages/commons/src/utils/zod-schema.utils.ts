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

export const mapUnionOptions = <
    TDiscriminator extends string,
    TOption extends z.ZodDiscriminatedUnionOption<TDiscriminator>,
    TMappedOption extends z.ZodDiscriminatedUnionOption<TDiscriminator>,
>(
    union: z.ZodDiscriminatedUnion<TDiscriminator, TOption[]>,
    mapper: (option: TOption) => TMappedOption,
): z.ZodDiscriminatedUnion<TDiscriminator, TMappedOption[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return z.discriminatedUnion(union.discriminator, union.options.map(mapper) as any)
}

export const jsonStringSchema = (reviver?: (this: unknown, key: string, value: unknown) => unknown) => {
    return z.string().transform((v, ctx) => {
        try {
            return JSON.parse(v, reviver)
        } catch (e) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                fatal: true,
                message: (e as Error).message,
            })

            return z.NEVER
        }
    })
}
