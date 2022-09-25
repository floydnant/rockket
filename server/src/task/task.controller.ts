import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { User } from '@prisma/client'
import { GetUser } from '../decorators/get-user.decorator'
import { CreateTaskCommentDto, CreateTaskDto, UpdateTaskCommentDto, UpdateTaskDto } from './task.dto'

@Controller('task')
export class TaskController {
    @Post()
    createTask(@GetUser() user: User, @Body() dto: CreateTaskDto) {
        return // call task service
    }
    @Get(':taskId')
    getTaskById(@GetUser() user: User, @Param('taskId') taskId: string) {
        return // call task service
    }
    @Patch(':taskId')
    updateTask(@GetUser() user: User, @Param('taskId') taskId: string, @Body() dto: UpdateTaskDto) {
        return // call task service
    }
    @Delete(':taskId')
    deleteTask(@GetUser() user: User, @Param('taskId') taskId: string) {
        return // call task service
    }

    // subtasks
    @Get(':taskId/subtasks')
    getSubtasks(@GetUser() user: User, @Param('taskId') taskId: string) {
        return // call task service
    }

    // task events
    @Get(':taskId/events')
    getTaskEvents(@GetUser() user: User, @Param('taskId') taskId: string) {
        return // call task service
    }

    // task comments
    @Get(':taskId/comments')
    getTaskComments(@GetUser() user: User, @Param('taskId') taskId: string) {
        return // call task service
    }
    @Post(':taskId/comment')
    createTaskComment(
        @GetUser() user: User,
        @Param('taskId') taskId: string,
        @Body() dto: CreateTaskCommentDto,
    ) {
        return // call task service
    }
    @Patch('comment/:commentId')
    updateTaskComment(
        @GetUser() user: User,
        @Param('commentId') commentId: string,
        @Body() dto: UpdateTaskCommentDto,
    ) {
        return // call task service
    }
    @Delete('comment/:commentId')
    deleteTaskComment(@GetUser() user: User, @Param('commentId') commentId: string) {
        return // call task service
    }
}
