import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DbHelper } from './prisma-abstractions/db-helper'
import { PrismaService } from './prisma-abstractions/prisma.service'

@Injectable()
export class AppService {
    constructor(prisma: PrismaService, private configService: ConfigService) {
        this.dbHelper = new DbHelper(prisma)
    }
    dbHelper: DbHelper

    getHello(): string {
        return 'Hello World!'
    }

    clearDb() {
        if (this.configService.get('TESTING_ENV') != 'true') throw new ForbiddenException()

        this.dbHelper.clearDb()
        return { message: 'Database cleared.' }
    }
}
