import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { CreateTaskResponse, Task, UpdateTaskResponse } from '@rockket/commons'
import { GetUser } from '../../decorators/get-user.decorator'
import { CreateTaskZodDto, UpdateTaskZodDto } from './task.dto'
import { TaskService } from './task.service'

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
}
