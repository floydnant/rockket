export const moveToMacroQueue = (callback: () => void) => setTimeout(callback, 0)

/** Replace all non word characters with dashes (excluding digits) and transform to lower case */
export const stripNonWordChars = (str: string) =>
    str
        .replace(/\W+/g, '-')
        .replace(/-+$|^-+/g, '')
        .toLowerCase()
