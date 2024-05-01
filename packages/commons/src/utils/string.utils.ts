export type ToString<T> = T extends number | boolean ? `${T}` : T extends string ? T : never

/** Concatenates the given functions'/classes' names with a dot and appends `()` at the end */
// eslint-disable-next-line @typescript-eslint/ban-types
export const fnNames = (...fns: Function[]) => {
    return fns.map(fn => fn.name).join('.') + '()'
}

export const newUuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}
