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
