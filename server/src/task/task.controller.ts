import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { GetUser } from '../decorators/get-user.decorator'
import { CreateTaskCommentDto, CreateTaskDto, UpdateTaskCommentDto, UpdateTaskDto } from './task.dto'
import { TaskService } from './task.service'

@UseGuards(AuthGuard())
@Controller('task')
export class TaskController {
    constructor(private taskService: TaskService) {}
    @Post()
    createTask(@GetUser() user: User, @Body() dto: CreateTaskDto) {
        console.log(user)
        return this.taskService.createTask(user.id, dto)
    }
    @Get(':taskId')
    getTaskById(@GetUser() user: User, @Param('taskId') taskId: string) {
        return this.taskService.getTaskById(user.id, taskId)
    }
    @Patch(':taskId')
    updateTask(@GetUser() user: User, @Param('taskId') taskId: string, @Body() dto: UpdateTaskDto) {
        return this.taskService.updateTask(user.id, taskId, dto)
    }
    @Delete(':taskId')
    deleteTask(@GetUser() user: User, @Param('taskId') taskId: string) {
        return this.taskService.deleteTask(user.id, taskId)
    }

    // subtasks
    @Get(':taskId/subtasks')
    getSubtasks(@GetUser() user: User, @Param('taskId') taskId: string) {
        return this.taskService.getSubtasks(user.id, taskId)
    }

    // task events
    @Get(':taskId/events')
    getTaskEvents(@GetUser() user: User, @Param('taskId') taskId: string) {
        return this.taskService.getTaskEvents(user.id, taskId)
    }

    // task comments
    @Get(':taskId/comments')
    getTaskComments(@GetUser() user: User, @Param('taskId') taskId: string) {
        return this.taskService.getTaskComments(user.id, taskId)
    }
    @Post(':taskId/comment')
    createTaskComment(
        @GetUser() user: User,
        @Param('taskId') taskId: string,
        @Body() dto: CreateTaskCommentDto,
    ) {
        return this.taskService.createTaskComment(user.id, taskId, dto)
    }
    @Patch('comment/:commentId')
    updateTaskComment(
        @GetUser() user: User,
        @Param('commentId') commentId: string,
        @Body() dto: UpdateTaskCommentDto,
    ) {
        return this.taskService.updateTaskComment(user.id, commentId, dto)
    }
    @Delete('comment/:commentId')
    deleteTaskComment(@GetUser() user: User, @Param('commentId') commentId: string) {
        return this.taskService.deleteTaskComment(user.id, commentId)
    }
}
