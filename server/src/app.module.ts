import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { configValidationSchema } from './config.schema'
import { PrismaModule } from './prisma-abstractions/prisma.module'
import { UserModule } from './user/user.module'
import { EntitiesModule } from './entities/entities.module'
import { InsightsService } from './insights.service'

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
    providers: [AppService, InsightsService],
    exports: [ConfigModule],
})
export class AppModule {}
