import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { GetUser } from '../../decorators/get-user.decorator'
import { CreateTasklistDto, UpdateTasklistDto, ShareTasklistDto } from './list.dto'

@UseGuards(AuthGuard())
@Controller()
export class ListController {
    @Get('lists')
    getRootLevelTasklists(@GetUser() user: User) {
        return // call list service
    }

    @Get('list/:listId/child-lists')
    getChildTasklists(@GetUser() user: User, @Param('listId') listId: string) {
        return // call list service
    }

    @Get('list/:listId')
    getTasklist(@GetUser() user: User, @Param('listId') listId: string) {
        return // call list service
    }
    @Get('list/:listId/tasks')
    getTasks(@GetUser() user: User, @Param('listId') listId: string) {
        return // call task service
    }

    @Post('list')
    createTasklist(@GetUser() user: User, @Body() dto: CreateTasklistDto) {
        return // call list service
    }

    @Patch('list/:listId')
    updateTasklist(@GetUser() user: User, @Param('listId') listId: string, @Body() dto: UpdateTasklistDto) {
        return // call list service
    }

    @Delete('list/:listId')
    deleteTasklist(@GetUser() user: User, @Param('listId') listId: string) {
        return // call list service
    }

    @Post('list/:listId/share')
    shareList(@GetUser() user: User, @Param('listId') listId: string, @Body() { userId }: ShareTasklistDto) {
        return // call list service
    }
}
