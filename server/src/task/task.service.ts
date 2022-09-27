import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ListPermission } from '@prisma/client'
import { ListRepository } from './list/list.repository'
import { CreateTaskCommentDto, CreateTaskDto, UpdateTaskCommentDto, UpdateTaskDto } from './task.dto'
import { TaskRepository } from './task.repository'

@Injectable()
export class TaskService {
    constructor(private taskRepository: TaskRepository, private listRepository: ListRepository) {}

    async createTask(userId: string, dto: CreateTaskDto) {
        const hasPermission = await this.listRepository.hasPermission(userId, dto.listId, ListPermission.Edit)
        if (!hasPermission)
            throw new ForbiddenException("You don't have permission to create tasks on this list")

        return this.taskRepository.createTask(userId, dto)
    }
    async getTaskById(userId: string, taskId: string) {
        const hasPermission = await this.hasPermission(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        return this.taskRepository.getTaskById(taskId)
    }
    async updateTask(userId: string, taskId: string, dto: UpdateTaskDto) {
        const hasPermission = await this.hasPermission(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        return this.taskRepository.updateTask(userId, taskId, dto)
    }
    async deleteTask(userId: string, taskId: string) {
        const hasPermission = await this.hasPermission(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        return this.taskRepository.deleteTask(taskId)
    }

    // subtasks
    async getSubtasks(userId: string, taskId: string) {
        const hasPermission = await this.hasPermission(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        return this.taskRepository.getSubtasks(taskId)
    }

    // task events
    async getTaskEvents(userId: string, taskId: string) {
        const hasPermission = await this.hasPermission(userId, taskId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this task")

        return this.taskRepository.getTaskEvents(taskId)
    }

    // task comments
    async getTaskComments(userId: string, taskId: string) {
        const hasPermission = await this.hasPermission(userId, taskId, ListPermission.View)
        if (!hasPermission)
            throw new ForbiddenException("You don't have permission to view comments on this task")

        return this.taskRepository.getTaskComments(taskId)
    }
    async createTaskComment(userId: string, taskId: string, dto: CreateTaskCommentDto) {
        const hasPermission = await this.hasPermission(userId, taskId, ListPermission.Comment)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to comment on this task")

        return this.taskRepository.createTaskComment(userId, taskId, dto)
    }
    updateTaskComment(userId: string, commentId: string, dto: UpdateTaskCommentDto) {
        // @TODO: validate comment author here
        return this.taskRepository.updateTaskComment(commentId, dto)
    }
    deleteTaskComment(userId: string, commentId: string) {
        // @TODO: validate comment author here
        return this.taskRepository.deleteTaskComment(commentId)
    }

    async getRootLevelTasks(userId: string, listId: string) {
        const hasPermission = await this.listRepository.hasPermission(userId, listId, ListPermission.View)
        if (!hasPermission) throw new ForbiddenException("You don't have permission to view this list")

        return this.taskRepository.getRootLevelTasks(listId)
    }

    async hasPermission(userId: string, taskId: string, requiredPermission: ListPermission) {
        // @TODO: not ideal, because we have to fetch both task and list to validate permissions, just to potentially refetch again
        const task = await this.taskRepository.getTaskById(taskId)
        if (!task) throw new NotFoundException('Could not find task')

        return this.listRepository.hasPermission(userId, task?.listId, requiredPermission)
    }
}
