export type ToString<T> = T extends number | boolean ? `${T}` : T extends string ? T : never

// eslint-disable-next-line @typescript-eslint/ban-types
export const fnContext = (...fns: Function[]) => {
    const context = fns.map(fn => fn.name).join('.')
    return context + '()'
}
