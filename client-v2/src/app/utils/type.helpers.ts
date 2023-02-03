export type PartialRequired<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cons<H, T> = T extends readonly any[]
    ? ((h: H, ...t: T) => void) extends (...r: infer R) => void
        ? R
        : never
    : never

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

/** Get a union of tuples containing all possible key paths in `T` */
export type PathsTuples<T, D extends number = 10> = [D] extends [never]
    ? never
    : T extends object
    ? {
          [K in keyof T]-?:
              | [K]
              | (PathsTuples<T[K], Prev[D]> extends infer P ? (P extends [] ? never : Cons<K, P>) : never)
      }[keyof T]
    : []

type Join<K, S extends string, P> = K extends string | number
    ? P extends string | number
        ? `${K}${'' extends P ? '' : S}${P}`
        : never
    : never

/** Similar to `PathsTuples` but keys concatenated with `S` instead of tuples. */
export type PathsConcatenated<T, S extends string = '.', D extends number = 10> = [D] extends [never]
    ? never
    : T extends object
    ? {
          [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, S, PathsConcatenated<T[K], S, Prev[D]>> : never
      }[keyof T]
    : ''

/** Get a union of all nested keys of `T` concatenated with `S`. (similar to `Paths` but only deep key paths) */
export type LeavesConcatenated<T, S extends string = '.', D extends number = 10> = [D] extends [never]
    ? never
    : T extends object
    ? { [K in keyof T]-?: Join<K, S, LeavesConcatenated<T[K], S, Prev[D]>> }[keyof T]
    : ''
