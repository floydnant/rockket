import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaService } from './prisma.service'

export interface DbHelperOptions {
    cacheTableNames: boolean
}

@Injectable()
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

        names.forEach(async (tableName) => {
            await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tableName}" CASCADE;`)
        })

        // Reset the autoincrement I guess (we're using uuids anyway)
        // const relnames = await this.prisma
        //     .$queryRaw`SELECT c.relname FROM pg_class AS c JOIN pg_namespace AS n ON c.relnamespace = n.oid WHERE c.relkind='S' AND n.nspname='${this.dbSchemaName}';`
        // for (const { relname } of relnames as { relname: string }[]) {
        //     await this.prisma
        //         .$queryRaw`ALTER SEQUENCE \"${this.dbSchemaName}\".\"${relname}\" RESTART WITH 1;`
        // }
        return this.disconnect
    }
}
