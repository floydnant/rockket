import { ToString, entriesOf } from '@rockket/commons'
import { z } from 'zod'

export type DoubleQuoted<T extends string> = `"${T}"`
export const wrapInDoubleQuotes = <T extends string>(value: T): DoubleQuoted<T> => {
    return `"${value}"`
}

export type FlippedMapping<T extends Record<string, string>> = {
    [K in keyof T as ToString<T[K]>]: ToString<K>
}
export const flipMapping = <T extends Record<string, string>>(mapping: T): FlippedMapping<T> => {
    const flipped = {} as Record<string, string>
    for (const [key, value] of entriesOf(mapping)) {
        flipped[value] = key as string
    }
    return flipped as FlippedMapping<T>
}

export const mapKeys = (obj: Record<string, unknown>, mapping: Record<string, string>) => {
    const mapped = {} as Record<string, unknown>
    for (const [key, value] of entriesOf(obj)) {
        mapped[mapping[key]] = value
    }
    return mapped
}

export const createSqlTable = <
    TModel extends z.Schema<object>,
    TMapping extends Record<keyof z.infer<TModel>, string>,
    TTableName extends string,
>(config: {
    tableName: TTableName
    coreSchema: TModel
    columns: TMapping
}) => {
    const flippedColumns = flipMapping(config.columns)
    const dbRowToCoreSchema = z
        .record(z.unknown())
        .transform(value => mapKeys(value, flippedColumns))
        .pipe(config.coreSchema)
    const dbRowsToCoreArraySchema = dbRowToCoreSchema.array()

    return {
        ...config.columns,
        $tableName: config.tableName,
        $columns: config.columns,
        $flippedColumns: flippedColumns,

        parseRow: (row: Record<string, unknown>, params?: Partial<z.ParseParams>) => {
            // @TODO: throw db integrity/inconsistency exception
            return dbRowToCoreSchema.parse(row, params)
        },
        parseRows: (row: Record<string, unknown>[], params?: Partial<z.ParseParams>) => {
            // @TODO: throw db integrity/inconsistency exception
            return dbRowsToCoreArraySchema.parse(row, params)
        },
    }
}
