import { Injectable } from '@nestjs/common'
import { Task as DbTask } from '@prisma/client'
import { Task, EntityEvent, entityEventSchema } from '@rockket/commons'
import { PrismaService } from '../../prisma-abstractions/prisma.service'
import { CreateTaskCommentZodDto, CreateTaskZodDto, UpdateTaskCommentZodDto } from './task.dto'

@Injectable()
export class TaskRepository {
    constructor(private prisma: PrismaService) {}

    async getAllTasks(userId: string): Promise<DbTask[]> {
        return this.prisma.task.findMany({
            /* @TODO: We are not fetching tasks for nested lists that the user has indirect access to 
                      (lists that the user has not explicitly permission for, but can access due to having permission for ancestor lists) */
            where: { list: { participants: { some: { userId } } } },
            orderBy: { createdAt: 'desc' },
        })
    }

    async createTask(userId: string, dto: CreateTaskZodDto): Promise<DbTask> {
        return this.prisma.task.create({
            data: {
                ...dto,
                ownerId: userId,
                createdAt: new Date(),
                statusUpdatedAt: new Date(),
            },
        })
    }

    async getTaskById(taskId: string): Promise<DbTask | null> {
        return this.prisma.task.findUnique({ where: { id: taskId } })
    }

    async updateTask(taskId: string, updatedTask: Partial<Task>, events: EntityEvent[]): Promise<void> {
        await this.prisma.task.update({
            where: { id: taskId },
            data: {
                ...updatedTask,
                events: { create: events },
            },
        })
    }

    async deleteTask(taskId: string) {
        // @SCHEMA_CHANGE: Task
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

        const taskIds = nestedChildren.map(child => child.id)

        const transactionResult = await this.prisma.$transaction([
            this.prisma.entityEvent.deleteMany({ where: { taskId: { in: taskIds } } }),
            this.prisma.taskComment.deleteMany({ where: { taskId: { in: taskIds } } }),
            this.prisma.task.deleteMany({ where: { id: { in: taskIds } } }),
        ])

        return {
            taskEvents: transactionResult[0].count,
            taskComments: transactionResult[1].count,
            tasks: transactionResult[2].count,
        }
    }

    async getSubtasks(taskId: string): Promise<DbTask[]> {
        return this.prisma.task.findMany({ where: { parentTaskId: taskId } })
    }

    async getTaskEvents(taskId: string) {
        const events = await this.prisma.entityEvent.findMany({
            where: { taskId },
            orderBy: { timestamp: 'asc' },
        })

        // @TODO: throw db inconsistency exception here
        return entityEventSchema.array().parse(events)
    }

    async getTaskComments(taskId: string) {
        return this.prisma.taskComment.findMany({
            where: { taskId },
            // OrderBy: { commentedAt: 'asc' }, // maybe this won't be nececcary, let's see
        })
    }
    async createTaskComment(userId: string, taskId: string, dto: CreateTaskCommentZodDto) {
        return this.prisma.taskComment.create({
            data: {
                userId,
                taskId,
                ...dto,
            },
        })
    }
    async updateTaskComment(commentId: string, dto: UpdateTaskCommentZodDto) {
        return this.prisma.taskComment.update({
            where: { id: commentId },
            data: { ...dto, wasEdited: true },
        })
    }
    async deleteTaskComment(commentId: string) {
        return this.prisma.taskComment.delete({ where: { id: commentId } })
    }

    async getRootLevelTasks(listId: string): Promise<DbTask[]> {
        return this.prisma.task.findMany({
            where: { listId, parentTaskId: null },
        })
    }

    async search(userId: string, query: string): Promise<DbTask[]> {
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
