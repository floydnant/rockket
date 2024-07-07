import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ListPermission, Task } from '@prisma/client'
import {
    EntityEvent,
    EntityEventType,
    buildTaskEventsFromDto,
    getTaskStatusUpdatedAt,
    newEntityEvent,
    newUuid,
} from '@rockket/commons'
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

        let newParentTask: Task | null = null
        let nestedSubtasks: Task[] | null = null

        // Ensure valid parent task
        if (updateTaskCommand.parentTaskId && updateTaskCommand.parentTaskId != task.parentTaskId) {
            // Ensure task is not its own parent
            if (updateTaskCommand.parentTaskId == task.id) {
                throw new ForbiddenException('A task cannot be its own parent')
            }

            // Ensure new parent task is not a descendant of the task
            nestedSubtasks = await this.taskRepository.getSubtasksRecursive(taskId)
            if (nestedSubtasks.some(subtask => subtask.id == updateTaskCommand.parentTaskId)) {
                throw new ForbiddenException('A task cannot be its own descendant')
            }

            // Check if the new parent task is also in a different list
            newParentTask = await this.taskRepository.getTaskById(updateTaskCommand.parentTaskId)
            if (!newParentTask) throw new NotFoundException('Could not find parent task')

            if (newParentTask.listId != task.listId) {
                updateTaskCommand.listId = newParentTask.listId
            }
        }
        if (updateTaskCommand.listId) {
            // If the listId was set explicitly, it means that we want to move the task
            // there as a top level one, meaning the parentTaskId should be removed
            if (updateTaskCommand.listId && !updateTaskCommand.parentTaskId) {
                updateTaskCommand.parentTaskId = null
            } else if (updateTaskCommand.listId && updateTaskCommand.parentTaskId) {
                newParentTask ??= await this.taskRepository.getTaskById(updateTaskCommand.parentTaskId)
                if (!newParentTask) throw new NotFoundException('Could not find parent task')

                if (newParentTask.listId != updateTaskCommand.listId) {
                    throw new ForbiddenException(
                        'A task cannot be moved to a different list than its parent task',
                    )
                }
            }

            if (updateTaskCommand.listId != task.listId) {
                const listChangedEvent = newEntityEvent(
                    EntityEventType.TaskParentListChanged,
                    {
                        prevValue: task.listId,
                        newValue: updateTaskCommand.listId,
                    },
                    userId,
                )

                // @TODO: this can be optimized by directly updating the listId in the query instead of
                // fetching all subtasks first and then updating each task individually
                nestedSubtasks ??= await this.taskRepository.getSubtasksRecursive(taskId)
                const promises = nestedSubtasks.map(subtask => {
                    return this.taskRepository.updateTask(subtask.id, { listId: updateTaskCommand.listId }, [
                        { ...listChangedEvent, id: newUuid() },
                    ])
                })
                await Promise.all(promises)
            }
        }

        const taskEvents = buildTaskEventsFromDto(task, updateTaskCommand, userId)
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
