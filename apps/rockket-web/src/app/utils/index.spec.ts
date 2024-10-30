import { insertElementAfter } from '.'

describe(insertElementAfter.name + '()', () => {
    it('should insert after the given position', () => {
        const arr = [1, 3, 3.5, 5, 6]
        const newElem = null

        const result = insertElementAfter(arr, 2, newElem)

        expect(result).toEqual([1, 3, 3.5, null, 5, 6])
    })

    it('should insert at the beginning', () => {
        const arr = [1, 3, 3.5, 5, 6]
        const newElem = null

        const result = insertElementAfter(arr, -5, newElem)

        expect(result).toEqual([null, 1, 3, 3.5, 5, 6])
    })

    it('should insert at the end', () => {
        const arr = [1, 3, 3.5, 5, 6]
        const newElem = null

        const result = insertElementAfter(arr, 20, newElem)

        expect(result).toEqual([1, 3, 3.5, 5, 6, null])
    })
})
