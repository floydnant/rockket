import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { configValidationSchema } from './config.schema'
import { EntitiesModule } from './entities/entities.module'
import { InsightsService } from './insights.service'
import { PrismaModule } from './prisma-abstractions/prisma.module'
import { UserModule } from './user/user.module'
import { ZodValidationExceptionFilter } from './zod-validation.exception-filter'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [`.env`, `.env.${process.env.RAILWAY_ENVIRONMENT?.toLowerCase()}`],
            validationSchema: configValidationSchema,
        }),
        PrismaModule,
        UserModule,
        EntitiesModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        InsightsService,
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
        {
            provide: APP_FILTER,
            useClass: ZodValidationExceptionFilter,
        },
    ],
    exports: [ConfigModule],
})
export class AppModule {}
