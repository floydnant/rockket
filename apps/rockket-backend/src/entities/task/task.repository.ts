import { Injectable } from '@nestjs/common'
import { Task as DbTask } from '@prisma/client'
import { EntityEvent, Task, entityEventSchema, valuesOf } from '@rockket/commons'
import { PrismaService } from '../../prisma-abstractions/prisma.service'
import { CommentService } from '../comment/comment.service'
import { CreateTaskZodDto } from './task.dto'
import { taskTable } from './task.db-table'
import { wrapInDoubleQuotes } from '../../shared/sql.utils'

@Injectable()
export class TaskRepository {
    constructor(private prisma: PrismaService, private commentsService: CommentService) {}

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
        const nestedChildren: { id: string; parentTaskId: string }[] = await this.prisma.$queryRawUnsafe(`
            WITH RECURSIVE all_tasks AS (
                SELECT "${taskTable.id}", "${taskTable.parentTaskId}"
                FROM public."${taskTable.$tableName}"
                WHERE "${taskTable.id}" = '${taskId}'

                UNION

                SELECT t."${taskTable.id}", t."${taskTable.parentTaskId}"
                FROM public."${taskTable.$tableName}" t
                    INNER JOIN all_tasks a ON a."${taskTable.id}" = t."${taskTable.parentTaskId}"
            )
            SELECT * FROM all_tasks
        `)

        const taskIds = nestedChildren.map(child => child.id)

        const [{ count: affectedComments }, { count: affectedTasks }] = await this.prisma.$transaction([
            this.prisma.entityComment.deleteMany({ where: { taskId: { in: taskIds } } }),
            this.prisma.task.deleteMany({ where: { id: { in: taskIds } } }),
        ])

        return { affectedComments, affectedTasks }
    }

    async getSubtasks(taskId: string): Promise<DbTask[]> {
        return this.prisma.task.findMany({ where: { parentTaskId: taskId } })
    }
    async getSubtasksRecursive(taskId: string): Promise<DbTask[]> {
        const allColumns = valuesOf(taskTable.$columns).map(wrapInDoubleQuotes)

        // @SCHEMA_CHANGE: Task
        const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
            WITH RECURSIVE all_tasks AS (
                SELECT ${allColumns.join(', ')}
                FROM public."${taskTable.$tableName}"
                WHERE "${taskTable.id}" = '${taskId}'

                UNION

                SELECT ${allColumns.map(v => 't.' + v).join(', ')}
                FROM public."${taskTable.$tableName}" t
                    INNER JOIN all_tasks a ON a."${taskTable.id}" = t."${taskTable.parentTaskId}"
            )
            SELECT * FROM all_tasks
        `)
        const nestedSubtasks = taskTable.parseRows(rows)

        return nestedSubtasks.filter(task => task.id !== taskId)
    }

    async getTaskEvents(taskId: string) {
        const events = await this.prisma.entityEvent.findMany({
            where: { taskId },
            orderBy: { timestamp: 'asc' },
        })

        // @TODO: throw db inconsistency exception here
        return entityEventSchema.array().parse(events)
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
