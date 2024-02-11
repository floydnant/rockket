import { z } from 'zod'
import { flattenObject } from './flatten-object.util'

describe(`${flattenObject.name}()`, () => {
    it('should flatten an object', () => {
        const inputObj = { a: { b: { c: 'value', d: 123, e: true } } } as const
        const outputObj = flattenObject(inputObj)

        // Runtime and type assertion
        expect(outputObj).toEqual({
            'a.b.c': 'value',
            'a.b.d': 123,
            'a.b.e': true,
        } satisfies typeof outputObj)
    })

    it('can flatten an object with a prefix', () => {
        const inputObj = { a: { b: { c: 'value' } } } as const
        const outputObj = flattenObject(inputObj, 'prefix')

        // Runtime and type assertion
        expect(outputObj).toEqual({ 'prefix.a.b.c': 'value' } satisfies typeof outputObj)
    })

    it('can flatten an object until it encounters a function (default predicate)', () => {
        const someFn = () => ''
        const inputObj = { a: { b: { c: 'value', someFn } } } as const
        const outputObj = flattenObject(inputObj)

        // Runtime and type assertion
        expect(outputObj).toEqual({ 'a.b.c': 'value', 'a.b.someFn': someFn } satisfies typeof outputObj)
    })

    it('can flatten an object until it encounters a specific object (custom predicate)', () => {
        const someFn = () => ''
        const inputObj = {
            a: {
                b: {
                    c: 'value',
                    someFn,
                    deeper: {
                        status: 123,
                        codes: ['code1', 'code2'],
                    },
                },
            },
        } as const

        const schema = z.object({ status: z.number() })
        const outputObj = flattenObject(
            inputObj,
            '',
            (value): value is { status: number } => schema.safeParse(value).success,
        )

        // Runtime and type assertion
        expect(outputObj).toEqual({
            'a.b.c': 'value',
            'a.b.someFn': someFn,
            'a.b.deeper': {
                status: 123,
                codes: ['code1', 'code2'],
            },
        } satisfies typeof outputObj)
    })

    it.todo('treats arrays as primetives')

    it('treats classes as primetives', () => {
        class SomeClass {
            someProperty = 'the value'
        }
        const inputObj = { a: { b: { c: SomeClass } } } as const
        const outputObj = flattenObject(inputObj)

        // Runtime and type assertion
        expect(outputObj).toEqual({ 'a.b.c': SomeClass } satisfies typeof outputObj)
    })
})
