import { ForbiddenException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DbHelper } from './prisma-abstractions/db-helper'
import { PrismaService } from './prisma-abstractions/prisma.service'

@Injectable()
export class AppService {
    constructor(prisma: PrismaService, private configService: ConfigService) {
        this.dbHelper = new DbHelper(prisma)
    }
    dbHelper: DbHelper
    logger = new Logger('AppService')

    getHello(): string {
        return 'Hello World!'
    }

    // @TODO: this should not reside in application code, lets move it to a CLI/npm script
    async clearDb() {
        if (this.configService.get('TESTING_ENV') != 'true') throw new ForbiddenException()

        await this.dbHelper.clearDb()
        this.logger.verbose('Cleared database')
        return { message: 'Database cleared.' }
    }
}
