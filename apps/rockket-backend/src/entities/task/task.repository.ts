import { Injectable, NotFoundException } from '@nestjs/common'
import { TaskEventUpdateField } from '@prisma/client'
import { SELECT_user_preview } from '../../prisma-abstractions/query-helpers'
import { PrismaService } from '../../prisma-abstractions/prisma.service'
import { CreateTaskCommentDto, CreateTaskDto, UpdateTaskCommentDto, UpdateTaskDto } from './task.dto'

@Injectable()
export class TaskRepository {
    constructor(private prisma: PrismaService) {}

    async getAllTasks(userId: string) {
        return this.prisma.task.findMany({
            /* @TODO: We are not fetching tasks for nested lists that the user has indirect access to 
                      (lists that the user has not explicitly permission for, but can access due to having permission for ancestor lists) */
            where: { list: { participants: { some: { userId } } } },
            select: {
                id: true,
                title: true,
                listId: true,
                parentTaskId: true,
                status: true,
                priority: true,
                description: true,
            },
        })
    }

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

        const eventsToCreate = eventRelatedUpdatedFields
            .filter(key => task[key]?.toString() != dto[key]) // Skip creating events when the value didn't actually change
            .map(key => ({
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
        // @SCHEMA_CHANGE requires updating this query
        const nestedChildren: { id: string; parentTaskId: string }[] = await this.prisma.$queryRaw`
            WITH RECURSIVE all_tasks AS (
                SELECT id, "parentTaskId"
                FROM public."Task"
                WHERE id = ${taskId}

                UNION

                SELECT t.id, t."parentTaskId"
                FROM public."Task" t
                    INNER JOIN all_tasks a ON a.id = t."parentTaskId"
            )
            SELECT * FROM all_tasks
        `

        const taskIds = nestedChildren.map((child) => child.id)

        const transactionResult = await this.prisma.$transaction([
            this.prisma.taskEvent.deleteMany({ where: { taskId: { in: taskIds } } }),
            this.prisma.taskComment.deleteMany({ where: { taskId: { in: taskIds } } }),
            this.prisma.task.deleteMany({ where: { id: { in: taskIds } } }),
        ])

        return {
            taskEvents: transactionResult[0].count,
            taskComments: transactionResult[1].count,
            tasks: transactionResult[2].count,
        }
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
            // OrderBy: { commentedAt: 'asc' }, // maybe this won't be nececcary, let's see
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

    async search(userId: string, query: string) {
        // @TODO: search for comments as well
        return this.prisma.task.findMany({
            where: {
                list: { participants: { some: { userId } } },
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
        })
    }
}
