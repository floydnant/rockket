import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { GetUser } from '../decorators/get-user.decorator'
import { UpdateEmailZodDto, UpdatePasswordZodDto, UpdateUserZodDto } from './user.dto'
import { UserService } from './user.service'

@UseGuards(AuthGuard())
@Controller('user')
export class UsersController {
    constructor(private usersService: UserService) {}

    @Patch('/email')
    async updateEmail(@GetUser() user: User, @Body() updateEmailDto: UpdateEmailZodDto) {
        return await this.usersService.updateEmail(user, updateEmailDto)
    }
    @Patch('/password')
    async updatePassword(@GetUser() user: User, @Body() updatePasswordDto: UpdatePasswordZodDto) {
        return await this.usersService.updatePassword(user, updatePasswordDto)
    }
    @Patch()
    async updateUser(@GetUser() user: User, @Body() updateUserDto: UpdateUserZodDto) {
        return await this.usersService.updateUser(user, updateUserDto)
    }

    @Delete()
    async deleteUser(@GetUser() user: User, @Body() { password }: { password: string }) {
        return await this.usersService.deleteUser(user, password)
    }

    @Get('/email')
    getEmail(@GetUser() user: User) {
        return { email: user.email }
    }

    @Get('/search')
    async searchUsers(@GetUser() user: User, @Query('q') queryString: string) {
        return await this.usersService.searchUsers(user.id, queryString)
    }

    @Get('/:id')
    async getUser(@GetUser() requestingUser: User, @Param('id') id: string) {
        return await this.usersService.getUser(requestingUser.id, id)
    }
}
