import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { GetUser } from '../decorators/get-user.decorator'
import { LoginZodDto, SignupZodDto } from './user.dto'
import { UserService } from './user.service'

@Controller('auth')
export class AuthController {
    constructor(private usersService: UserService) {}

    private logger = new Logger('AuthController')

    @Post('/signup') signUp(@Body() credentials: SignupZodDto) {
        this.logger.verbose(`New user signing up: '${credentials.username}'`)
        return this.usersService.signup(credentials)
    }

    @Post('/login') login(@Body() credentials: LoginZodDto) {
        this.logger.verbose(`User logging in: '${credentials.email}'`)
        return this.usersService.login(credentials)
    }

    @UseGuards(AuthGuard())
    @Get('/me')
    meQuery(@GetUser() user: User) {
        this.logger.verbose(`meQuery from: '${user.username}'`)
        return this.usersService.newAuthTokenResponse(user)
    }
}
