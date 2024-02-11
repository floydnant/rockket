/* eslint-disable @nx/enforce-module-boundaries */
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../../../rockket-backend/src/app.module'

export const initApplication = async (): Promise<INestApplication> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile()

    let app = moduleFixture.createNestApplication()
    app.enableShutdownHooks()

    app = await app.init()
    return app
}
