import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { GetUser } from '../../decorators/get-user.decorator'
import {
    CreateTaskCommentZodDto,
    CreateTaskZodDto,
    UpdateTaskCommentZodDto,
    UpdateTaskZodDto,
} from './task.dto'
import { TaskService } from './task.service'
import { CreateTaskResponse, Task, UpdateTaskResponse } from '@rockket/commons'

@UseGuards(AuthGuard())
@Controller('task')
export class TaskController {
    constructor(private taskService: TaskService) {}

    @Get('previews')
    getAllTaskPreviews(@GetUser() user: User) {
        return this.taskService.getAllTaskPreviews(user.id)
    }

    @Post()
    createTask(@GetUser() user: User, @Body() dto: CreateTaskZodDto): Promise<CreateTaskResponse> {
        return this.taskService.createTask(user.id, dto)
    }
    @Get(':taskId')
    getTaskById(@GetUser() user: User, @Param('taskId') taskId: string): Promise<Task> {
        return this.taskService.getTaskById(user.id, taskId)
    }
    @Patch(':taskId')
    updateTask(
        @GetUser() user: User,
        @Param('taskId') taskId: string,
        @Body() dto: UpdateTaskZodDto,
    ): Promise<UpdateTaskResponse> {
        return this.taskService.updateTask(user.id, taskId, dto)
    }
    @Delete(':taskId')
    deleteTask(@GetUser() user: User, @Param('taskId') taskId: string) {
        return this.taskService.deleteTask(user.id, taskId)
    }

    // Subtasks
    @Get(':taskId/subtasks')
    getSubtasks(@GetUser() user: User, @Param('taskId') taskId: string) {
        return this.taskService.getSubtasks(user.id, taskId)
    }

    // Task events
    @Get(':taskId/events')
    getTaskEvents(@GetUser() user: User, @Param('taskId') taskId: string) {
        return this.taskService.getTaskEvents(user.id, taskId)
    }

    // Task comments
    @Get(':taskId/comments')
    getTaskComments(@GetUser() user: User, @Param('taskId') taskId: string) {
        return this.taskService.getTaskComments(user.id, taskId)
    }
    @Post(':taskId/comment')
    createTaskComment(
        @GetUser() user: User,
        @Param('taskId') taskId: string,
        @Body() dto: CreateTaskCommentZodDto,
    ) {
        return this.taskService.createTaskComment(user.id, taskId, dto)
    }
    @Patch('comment/:commentId')
    updateTaskComment(
        @GetUser() user: User,
        @Param('commentId') commentId: string,
        @Body() dto: UpdateTaskCommentZodDto,
    ) {
        return this.taskService.updateTaskComment(user.id, commentId, dto)
    }
    @Delete('comment/:commentId')
    deleteTaskComment(@GetUser() user: User, @Param('commentId') commentId: string) {
        return this.taskService.deleteTaskComment(user.id, commentId)
    }
}
