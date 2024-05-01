import { pickFromObj } from './object.utils'
import { fnNames } from './string.utils'

describe(fnNames(pickFromObj), () => {
    it('should extract the keys from the object', () => {
        const obj = {
            a: 'A',
            b: 'B',
            c: 'C',
        } as const

        const extracted = pickFromObj(obj, ['a', 'c'])
        expect(extracted).toEqual({ a: 'A', c: 'C' })
    })

    it('works w/ enums as well', () => {
        enum MyEnum {
            A = 'A',
            B = 'B',
            C = 'C',
        }

        const pickedEnumObj = pickFromObj(MyEnum, ['A', 'C'])
        expect(pickedEnumObj).toEqual({ A: 'A', C: 'C' })
    })
})
