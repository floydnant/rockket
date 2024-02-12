import { PrismaClient } from '@prisma/client'
import { PrismaService } from './prisma.service'

export interface DbHelperOptions {
    cacheTableNames: boolean
}

export class DbHelper {
    constructor(private prisma: PrismaClient | PrismaService, private options?: Partial<DbHelperOptions>) {
        prisma.$connect()

        this.options ||= { cacheTableNames: true }
    }

    private disconnect = { disconnect: () => this.$disconnect() }
    $disconnect() {
        this.prisma.$disconnect()
    }

    cachedTableNames?: string[]
    async getTables() {
        if (this.options?.cacheTableNames && this.cachedTableNames) return this.cachedTableNames
        const tables = (await this.prisma
            .$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public' AND NOT tablename LIKE '_prisma%'`) as {
            tablename: string
        }[]
        const tableNames = tables.map(({ tablename }) => tablename)
        this.cachedTableNames = tableNames

        return tableNames
    }

    /**
     * ### Truncates all public tables (except the ones starting with '_prisma')
     * Special fast path to drop data from a postgres database.
     *
     * This is an optimization which is particularly crucial in a testing context.
     * This code path takes milliseconds, vs ~7 seconds for a migrate reset + db push
     */
    async clearDb(tableNames?: string[] | Promise<string[]>) {
        let names = await tableNames
        names ||= await this.getTables()

        // Console.time(`TRUNCATED tables: ${names}`)
        await this.prisma.$transaction(
            names.map(name => this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${name}" CASCADE;`)),
        )
        // Console.timeEnd(`TRUNCATED tables: ${names}`)

        // // console.time(`CLEARED DATABASE`)
        // for (const tableName of names) {
        //     // console.time(`TRUNCATE table ${tableName}`)
        //     await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tableName}" CASCADE;`)
        //     // console.timeEnd(`TRUNCATE table ${tableName}`)
        // }
        // // console.timeEnd(`CLEARED DATABASE`)

        return this.disconnect
    }
}
