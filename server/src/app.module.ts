import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { configValidationSchema } from './config.schema'
import { PrismaModule } from './prisma-abstractions/prisma.module'
import { UserModule } from './user/user.module'
import { TaskModule } from './task/task.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [`.env`, `.env.${process.env.STAGE}`],
            validationSchema: configValidationSchema,
        }),
        PrismaModule,
        UserModule,
        TaskModule,
    ],
    controllers: [AppController],
    providers: [AppService],
    exports: [ConfigModule],
})
export class AppModule {}
