import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { GetUser } from '../../decorators/get-user.decorator'
import { TaskService } from '../task/task.service'
import { CreateTasklistDto, UpdateTasklistDto, ShareTasklistDto, UpdatePermissionsDto } from './list.dto'
import { ListService } from './list.service'

@UseGuards(AuthGuard())
@Controller()
export class ListController {
    constructor(
        private listService: ListService,
        private taskService: TaskService,
    ) {}

    @Post('list')
    createTasklist(@GetUser() user: User, @Body() dto: CreateTasklistDto) {
        return this.listService.createTaskList(user.id, dto)
    }
    @Get('list/:listId')
    getTasklist(@GetUser() user: User, @Param('listId') listId: string) {
        return this.listService.getTasklist(user.id, listId)
    }
    @Patch('list/:listId')
    updateTasklist(@GetUser() user: User, @Param('listId') listId: string, @Body() dto: UpdateTasklistDto) {
        return this.listService.updateTasklist(user.id, listId, dto)
    }
    @Delete('list/:listId')
    deleteTasklist(@GetUser() user: User, @Param('listId') listId: string) {
        return this.listService.deletelist(user.id, listId)
    }

    // root level list previews
    @Get('lists')
    getRootLevelTasklists(@GetUser() user: User) {
        return this.listService.getRootLevelTasklists(user.id)
    }

    // nested child list previews
    @Get('list/:listId/child-lists')
    getChildTasklists(@GetUser() user: User, @Param('listId') listId: string) {
        return this.listService.getChildTasklists(user.id, listId)
    }

    // tasklist sharing
    @Post('list/:listId/share/:userId')
    shareList(
        @GetUser() user: User,
        @Param('listId') listId: string,
        @Param('userId') userId: string,
        @Body() dto: ShareTasklistDto,
    ) {
        return this.listService.shareTasklist(user.id, listId, userId, dto)
    }
    @Patch('list/:listId/share/:userId')
    updateParticipantPermissions(
        @GetUser() user: User,
        @Param('listId') listId: string,
        @Param('userId') userId: string,
        @Body() dto: UpdatePermissionsDto,
    ) {
        return this.listService.updateParticipantPermissions(user.id, listId, userId, dto)
    }
    @Delete('list/:listId/share/:userId')
    removeParticipant(
        @GetUser() user: User,
        @Param('listId') listId: string,
        @Param('userId') userId: string,
    ) {
        return this.listService.removeParticipant(user.id, listId, userId)
    }

    // the actual tasks
    @Get('list/:listId/tasks')
    // @TODO: the response should be minimized to the TaskPreview
    getTasks(@GetUser() user: User, @Param('listId') listId: string) {
        return this.taskService.getRootLevelTasks(user.id, listId)
    }
}
