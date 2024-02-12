export type ToString<T> = T extends number | boolean ? `${T}` : T extends string ? T : never
