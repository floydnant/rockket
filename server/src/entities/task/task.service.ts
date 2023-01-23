import { ForbiddenException, Injectable } from '@nestjs/common'
import { ListPermission } from '@prisma/client'
import { PermissionsService } from '../permissions/permissions.service'
import { CreateTaskCommentDto, CreateTaskDto, UpdateTaskCommentDto, UpdateTaskDto } from './task.dto'
import { TaskRepository } from './task.repository'

@Injectable()
export class TaskService {
    constructor(private taskRepository: TaskRepository, private permissions: PermissionsService) {}

    async getAllTaskPreviews(userId: string) {
        return this.taskRepository.getAllTasks(userId)
    }

    async createTask(userId: string, dto: CreateTaskDto) {
        const hasPermission = await this.permissions.hasPermissionForList(
            userId,
            dto.listId,
            ListPermission.Edit,
        )
        if (!hasPermission)
            throw new ForbiddenException("You don't have permission to create tasks on this list")

        return this.taskRepository.createTask(userId, dto)
    }
    async getTaskById(userId: string, taskId: string) {
        const hasPermission = await this.permissions.hasPermissionForTask(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        return this.taskRepository.getTaskById(taskId)
    }
    async updateTask(userId: string, taskId: string, dto: UpdateTaskDto) {
        const hasPermission = await this.permissions.hasPermissionForTask(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        return this.taskRepository.updateTask(userId, taskId, dto)
    }
    async deleteTask(userId: string, taskId: string) {
        const hasPermission = await this.permissions.hasPermissionForTask(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        await this.taskRepository.deleteTask(taskId)
        return { successMessage: 'Task deleted successfully' }
    }

    // subtasks
    async getSubtasks(userId: string, taskId: string) {
        const hasPermission = await this.permissions.hasPermissionForTask(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        return this.taskRepository.getSubtasks(taskId)
    }

    // task events
    async getTaskEvents(userId: string, taskId: string) {
        const hasPermission = await this.permissions.hasPermissionForTask(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        return this.taskRepository.getTaskEvents(taskId)
    }

    // task comments
    async getTaskComments(userId: string, taskId: string) {
        const hasPermission = await this.permissions.hasPermissionForTask(userId, taskId, ListPermission.View)
        if (!hasPermission)
            throw new ForbiddenException("You don't have permission to view comments on this task")

        return this.taskRepository.getTaskComments(taskId)
    }
    async createTaskComment(userId: string, taskId: string, dto: CreateTaskCommentDto) {
        const hasPermission = await this.permissions.hasPermissionForTask(
            userId,
            taskId,
            ListPermission.Comment,
        )
        if (!hasPermission) throw new ForbiddenException("You don't have permission to comment on this task")

        return this.taskRepository.createTaskComment(userId, taskId, dto)
    }
    async updateTaskComment(userId: string, commentId: string, dto: UpdateTaskCommentDto) {
        const hasPermission = await this.permissions.hasPermissionForComment(userId, commentId, true)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to update this comment")

        return this.taskRepository.updateTaskComment(commentId, dto)
    }
    async deleteTaskComment(userId: string, commentId: string) {
        const hasPermission = await this.permissions.hasPermissionForComment(userId, commentId)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to delete this comment")

        return this.taskRepository.deleteTaskComment(commentId)
    }

    async getRootLevelTasks(userId: string, listId: string) {
        const hasPermission = await this.permissions.hasPermissionForList(userId, listId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this list")

        return this.taskRepository.getRootLevelTasks(listId)
    }
}
