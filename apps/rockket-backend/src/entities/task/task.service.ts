import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ListPermission, Task } from '@prisma/client'
import { EntityEvent, buildTaskEventsFromDto, getTaskStatusUpdatedAt } from '@rockket/commons'
import { PermissionsService } from '../permissions/permissions.service'
import { CreateTaskZodDto, UpdateTaskZodDto } from './task.dto'
import { TaskRepository } from './task.repository'

@Injectable()
export class TaskService {
    constructor(private taskRepository: TaskRepository, private permissions: PermissionsService) {}

    async getAllTaskPreviews(userId: string) {
        return this.taskRepository.getAllTasks(userId)
    }

    async createTask(userId: string, dto: CreateTaskZodDto) {
        const hasPermission = await this.permissions.hasPermissionForList(
            userId,
            dto.listId,
            ListPermission.Edit,
        )
        if (!hasPermission)
            throw new ForbiddenException("You don't have permission to create tasks on this list")

        return await this.taskRepository.createTask(userId, dto)
    }
    async getTaskById(userId: string, taskId: string) {
        const hasPermission = await this.permissions.hasPermissionForTask(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        const task = await this.taskRepository.getTaskById(taskId)
        if (!task) throw new NotFoundException('Could not find task')

        return task
    }

    async updateTask(
        userId: string,
        taskId: string,
        dto: UpdateTaskZodDto,
    ): Promise<{ task: Task; newEvents: EntityEvent[] }> {
        const hasPermission = await this.permissions.hasPermissionForTask(userId, taskId, ListPermission.Edit)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to update this task")

        const task = await this.taskRepository.getTaskById(taskId)
        if (!task) throw new NotFoundException('Could not find task')

        const updateTaskCommand: Partial<Task> = {
            ...dto,
            statusUpdatedAt: getTaskStatusUpdatedAt(task, dto.status),
        }
        const taskEvents = buildTaskEventsFromDto(task, dto, userId)

        await this.taskRepository.updateTask(taskId, updateTaskCommand, taskEvents)

        return {
            task: {
                ...task,
                ...updateTaskCommand,
            },
            newEvents: taskEvents,
        }
    }

    async deleteTask(userId: string, taskId: string) {
        const hasPermission = await this.permissions.hasPermissionForTask(userId, taskId, ListPermission.Edit)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to delete this task")

        const { affectedTasks: tasks, affectedComments: taskComments } = await this.taskRepository.deleteTask(
            taskId,
        )

        const tasksPlural = tasks == 1 ? '' : 's'
        const commentsPlural = taskComments == 1 ? '' : 's'
        const commentsMessage = taskComments ? ` and ${taskComments} related comment${commentsPlural}` : ''

        return {
            successMessage: `Deleted ${tasks} task${tasksPlural}${commentsMessage}.`,
        }
    }

    // Subtasks
    async getSubtasks(userId: string, taskId: string) {
        const hasPermission = await this.permissions.hasPermissionForTask(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        return await this.taskRepository.getSubtasks(taskId)
    }

    // Task events
    async getTaskEvents(userId: string, taskId: string) {
        const hasPermission = await this.permissions.hasPermissionForTask(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        return await this.taskRepository.getTaskEvents(taskId)
    }

    async getRootLevelTasks(userId: string, listId: string) {
        const hasPermission = await this.permissions.hasPermissionForList(userId, listId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this list")

        return await this.taskRepository.getRootLevelTasks(listId)
    }

    async search(userId: string, query: string) {
        return await this.taskRepository.search(userId, query)
    }
}
