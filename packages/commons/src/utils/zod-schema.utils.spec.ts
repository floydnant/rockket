import { z } from 'zod'
import { fnNames } from './string.utils'
import { objKeysToEnumSchema, pickFromZodNativeEnum } from './zod-schema.utils'

describe(fnNames(objKeysToEnumSchema), () => {
    it('should return an enum schema', () => {
        const obj = {
            a: 1,
            b: 2,
            c: 3,
        }
        const schema = objKeysToEnumSchema(obj)
        expect(schema.enum).toEqual(z.enum(['a', 'b', 'c']).enum)
    })
})

describe(fnNames(pickFromZodNativeEnum), () => {
    it('should pick the given enum members from the zod native enum', () => {
        const zodNativeEnumSchema = z.nativeEnum({
            A: 'A',
            B: 'B',
            C: 'C',
        } as const)
        const pickedEnumSchema = pickFromZodNativeEnum(zodNativeEnumSchema, ['A', 'C'])
        expect(pickedEnumSchema.enum).toEqual(z.enum(['A', 'C']).enum)
    })
})
