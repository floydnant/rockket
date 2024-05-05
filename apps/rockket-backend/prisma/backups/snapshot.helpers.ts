import { PrismaClient } from '@prisma/client'
import { PromiseType } from '@prisma/client/extension'

type NotPrefixedWith<T extends string | symbol, TPrefix extends string> = T extends symbol
    ? never
    : T extends `${TPrefix}${string}`
    ? never
    : T

export type PrismaEntity = NotPrefixedWith<keyof PrismaClient, '$'>

export type EntityModelType<TEntity extends PrismaEntity> = PromiseType<
    ReturnType<PrismaClient[TEntity]['findFirstOrThrow']>
>
export type DbSnapshot<T extends PrismaEntity = PrismaEntity> = {
    [K in T]: EntityModelType<K>[]
}

const listAll = async <TEntity extends PrismaEntity>(prisma: PrismaClient, entity: TEntity) => {
    const findMany = prisma[entity].findMany as () => ReturnType<PrismaClient[TEntity]['findMany']>
    return await findMany()
}

export const getSnapshot = async <TEntities extends Record<PrismaEntity, true>>(
    prisma: PrismaClient,
    entities: TEntities,
) => {
    const backup = await Promise.all(
        Object.keys(entities).map(async entity => {
            return [entity, await listAll(prisma, entity as PrismaEntity)] as const
        }),
    )

    return Object.fromEntries(backup) as DbSnapshot
}

const createAll = <TEntity extends PrismaEntity>(
    prisma: PrismaClient,
    entity: TEntity,
    data: EntityModelType<TEntity>[],
) => {
    console.log(`Creating ${entity}s...`)
    const createMany = prisma[entity].createMany as unknown as (args: {
        data: typeof data
        skipDuplicates?: boolean
    }) => ReturnType<PrismaClient[TEntity]['createMany']>

    return createMany({ data, skipDuplicates: true })
}

export const applySnapshot = async (prisma: PrismaClient, snapshot: DbSnapshot) => {
    const entries = Object.entries(snapshot)
    const operations = entries.map(([entity, data]) => {
        return createAll(prisma, entity as PrismaEntity, data)
    })

    const batchResult = await prisma.$transaction(operations)

    batchResult.forEach((result, i) => {
        const entity = entries[i][0]
        console.log(`${entity}s created:`, result.count)
    })
}
