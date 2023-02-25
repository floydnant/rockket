export type TypeProxy =
    | {
          __dataType: 'Map'
          value: Record<string, unknown>
      }
    | {
          __dataType: 'Set'
          value: Array<unknown>
      }

export const isTypeProxy = (value: unknown): value is TypeProxy => {
    return typeof value == 'object' && value !== null && '__dataType' in value
}

export const replacer = (_key: string, value: unknown) => {
    if (value instanceof Map) {
        return {
            __dataType: 'Map',
            value: Object.fromEntries(value),
        }
    }
    if (value instanceof Set) {
        return {
            __dataType: 'Set',
            value: Array.from(value),
        }
    }

    return value
}

export const reviver = (_key: string, value: unknown) => {
    if (!isTypeProxy(value)) return value

    if (value.__dataType == 'Map') return new Map(Object.entries(value.value))
    if (value.__dataType == 'Set') return new Set(value.value)

    return value
}
