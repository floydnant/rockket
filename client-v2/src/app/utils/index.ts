import { LeavesConcatenated } from './type.helpers'

export const moveToMacroQueue = (callback: () => void) => setTimeout(callback, 0)

/** Replace all non word characters with dashes (excluding digits) and transform to lower case */
export const stripNonWordChars = (str: string) =>
    str
        .replace(/\W+/g, '-')
        .replace(/-+$|^-+/g, '')
        .toLowerCase()

export const interpolateParams = (template: string, params: Record<string, string | number>) => {
    return Object.entries(params).reduce((acc, [key, value]) => {
        return acc.replace(new RegExp(`:${key}`, 'g'), value.toString())
    }, template)
}

export const flattenObject = <T extends Record<string, string | Record<string, string>>>(
    obj: T,
    prefix?: string
): Record<LeavesConcatenated<T>, string> => {
    const flattend = Object.entries(obj).reduce((acc, [key, value]) => {
        const prefix_ = prefix ? prefix + '.' : ''
        if (typeof value == 'string') {
            acc[prefix_ + key] = value
            return acc
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { ...acc, ...(flattenObject(value, prefix_ + key) as any) }
    }, {} as Record<string, string>)

    return flattend
}

/** Concat the values with matching keys of the objects. */
export const concatMatchingKeys = (
    obj1: Record<string, string>,
    obj2: Record<string, string>
): Record<string, string> => {
    const entries = Object.entries(obj1).map(([key, value]) => [key, `${value} ${obj2[key]}`])
    return Object.fromEntries(entries)
}

/** Insert an element after a given position.
 *
 * **Note:** This function mutates the original array.
 */
export const insertElementAfter = <T>(arr: Array<T>, position: number, elem: T) => {
    arr.splice(position + 1, 0, elem)

    return arr
}

/** Move an element at a given position to a specified position in the array.
 *
 * **Note:** This function mutates the original array.
 */
export const moveElement = <T>(arr: Array<T>, fromIndex: number, toIndex: number) => {
    const elem = arr.splice(fromIndex, 1)[0]
    insertElementAfter(arr, toIndex, elem)
    return arr
}
