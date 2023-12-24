import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { PrismaModule } from '../prisma-abstractions/prisma.module'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwt.strategy'
import { UsersController } from './user.controller'
import { UserService } from './user.service'

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: 60 * 60 * 24 * 7, // One week
                },
            }),
        }),
        PrismaModule,
    ],
    controllers: [AuthController, UsersController],
    providers: [UserService, JwtStrategy],
    exports: [JwtStrategy, PassportModule, UserService, JwtModule],
})
export class UserModule {}
