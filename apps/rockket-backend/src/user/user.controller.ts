import { Body, Controller, Delete, Get, Logger, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { GetUser } from '../decorators/get-user.decorator'
import { UpdateEmailZodDto, UpdatePasswordZodDto, UpdateUserZodDto } from './user.dto'
import { UserService } from './user.service'

@UseGuards(AuthGuard())
@Controller('user')
export class UsersController {
    constructor(private usersService: UserService) {}

    private logger = new Logger('UserController')

    @Patch('/email')
    updateEmail(@GetUser() user: User, @Body() updateEmailDto: UpdateEmailZodDto) {
        this.logger.verbose(`${user.username} wants to change email`)
        return this.usersService.updateEmail(user, updateEmailDto)
    }
    @Patch('/password')
    updatePassword(@GetUser() user: User, @Body() updatePasswordDto: UpdatePasswordZodDto) {
        this.logger.verbose(`${user.username} wants to change the password`)
        return this.usersService.updatePassword(user, updatePasswordDto)
    }
    @Patch()
    updateUser(@GetUser() user: User, @Body() updateUserDto: UpdateUserZodDto) {
        this.logger.verbose(`${user.username} wants to change username`)
        return this.usersService.updateUser(user, updateUserDto)
    }

    @Delete()
    deleteUser(@GetUser() user: User, @Body() { password }: { password: string }) {
        this.logger.verbose(`deleting user '${user.username}'`)
        return this.usersService.deleteUser(user, password)
    }

    @Get('/email')
    getEmail(@GetUser() user: User) {
        return { email: user.email }
    }

    @Get('/search')
    searchUsers(@GetUser() user: User, @Query('q') queryString: string) {
        this.logger.verbose(`'${user.username}' searches uses for ${queryString}`)
        return this.usersService.searchUsers(user.id, queryString)
    }

    @Get('/:id')
    getUser(@GetUser() requestingUser: User, @Param('id') id: string) {
        this.logger.verbose(`'${requestingUser.username}' gets information about ${id}`)
        return this.usersService.getUser(requestingUser.id, id)
    }
}
