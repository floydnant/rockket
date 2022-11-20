import { ConfigModule /* , ConfigService */ } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma-abstractions/prisma.module'
// import { PrismaService } from './prisma-abstractions/prisma.service'

describe('AppController', () => {
    let appController: AppController

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule, ConfigModule],
            controllers: [AppController],
            providers: [AppService],
        })
            // .overrideProvider(ConfigService)
            // .useValue({ get: () => '' })
            // .overrideProvider(PrismaService)
            // .useValue({ $connect() {} })
            .compile()

        appController = app.get<AppController>(AppController)
    })

    describe('root', () => {
        it('should return "Hello World!"', () => {
            expect(appController.getHello()).toBe('Hello World!')
        })
    })
})
