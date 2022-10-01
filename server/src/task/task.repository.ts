import { Injectable, NotFoundException } from '@nestjs/common'
import { TaskEventUpdateField } from '@prisma/client'
import { SELECT_user_preview } from '../prisma-abstractions/query-helpers'
import { PrismaService } from '../prisma-abstractions/prisma.service'
import { CreateTaskCommentDto, CreateTaskDto, UpdateTaskCommentDto, UpdateTaskDto } from './task.dto'

@Injectable()
export class TaskRepository {
    constructor(private prisma: PrismaService) {}

    async createTask(userId: string, dto: CreateTaskDto) {
        return this.prisma.task.create({
            data: {
                ownerId: userId,
                ...dto,
            },
        })
    }

    async getTaskById(taskId: string) {
        return this.prisma.task.findUnique({ where: { id: taskId } })
    }

    async updateTask(userId: string, taskId: string, dto: UpdateTaskDto) {
        const eventRelatedUpdatedFields = Object.keys(dto).filter(
            (key): key is keyof typeof TaskEventUpdateField => key in TaskEventUpdateField,
        )

        const task = await this.prisma.task.findUnique({ where: { id: taskId } })
        if (!task) throw new NotFoundException('Could not find task')

        // when something relevant changed, fetch the old data first
        // @TODO: skip creating events when the value did not actually change (was in the payload by mistake or sth.)
        const eventsToCreate = eventRelatedUpdatedFields.map((key) => ({
            updatedField: key,
            prevValue: task[key]?.toString(),
            newValue: dto[key],
            userId,
        }))

        const updatedTask = this.prisma.task.update({
            where: { id: taskId },
            data: {
                ...dto,
                events: { create: eventsToCreate },
            },
        })

        return updatedTask
    }

    async deleteTask(taskId: string) {
        return this.prisma.task.delete({ where: { id: taskId } })
    }

    async getSubtasks(taskId: string) {
        return this.prisma.task.findMany({ where: { parentTaskId: taskId } })
    }

    async getTaskEvents(taskId: string) {
        const events = await this.prisma.taskEvent.findMany({
            where: { taskId },
            select: {
                user: SELECT_user_preview,
                updatedField: true,
                newValue: true,
                prevValue: true,
                timestamp: true,
            },
        })

        /* @TODO: obviously this needs more work:
            - resolving taskId (BlockedBy) to the actual task
            - phrasing the message differently depending on
                - the field that changed
                - the previous value
        */

        return events.map((event) => ({
            ...event,
            message: `${event.user.username} changed ${event.updatedField} from '${event.prevValue}' to '${event.newValue}' at ${event.timestamp}`,
        }))
    }

    async getTaskComments(taskId: string) {
        return this.prisma.taskComment.findMany({
            where: { taskId },
            // orderBy: { commentedAt: 'asc' }, // maybe this won't be nececcary, let's see
        })
    }
    async createTaskComment(userId: string, taskId: string, dto: CreateTaskCommentDto) {
        return this.prisma.taskComment.create({
            data: {
                userId,
                taskId,
                ...dto,
            },
        })
    }
    async updateTaskComment(commentId: string, dto: UpdateTaskCommentDto) {
        return this.prisma.taskComment.update({
            where: { id: commentId },
            data: { ...dto, wasEdited: true },
        })
    }
    async deleteTaskComment(commentId: string) {
        return this.prisma.taskComment.delete({ where: { id: commentId } })
    }

    async getRootLevelTasks(listId: string) {
        return this.prisma.task.findMany({
            where: { listId, parentTaskId: null },
        })
    }
}
