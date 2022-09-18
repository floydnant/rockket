import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { configValidationSchema } from './config.schema'
import { PrismaModule } from './prisma-abstractions/prisma.module'

@Module({
    imports: [
        PrismaModule,
        ConfigModule.forRoot({
            envFilePath: [`.env`, `.env.${process.env.STAGE}`],
            validationSchema: configValidationSchema,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
    exports: [ConfigModule],
})
export class AppModule {}
