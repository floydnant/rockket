import { Injectable, NotFoundException } from '@nestjs/common'
import { ListPermission, Tasklist as DbTasklist } from '@prisma/client'
import { EntityEvent, Tasklist, entityEventSchema, valuesOf } from '@rockket/commons'
import { PrismaService } from '../../prisma-abstractions/prisma.service'
import { CreateTasklistZodDto, ShareTasklistZodDto, UpdatePermissionsZodDto } from './list.dto'
import { wrapInDoubleQuotes } from '../../shared/sql.utils'
import { listTable } from './list.db-table'

@Injectable()
export class ListRepository {
    constructor(private prisma: PrismaService) {}

    async createTasklist(userId: string, { parentListId, ...dto }: CreateTasklistZodDto) {
        if (parentListId) await this.getTasklistById(parentListId) // Throw if parentList not found

        return await this.prisma.tasklist.create({
            data: {
                ...dto,
                ...(!parentListId ? {} : { parentList: { connect: { id: parentListId } } }),
                owner: { connect: { id: userId } },
                participants: {
                    create: {
                        user: { connect: { id: userId } },
                        permission: ListPermission.Manage,
                    },
                },
            },
        })
    }

    async getTasklistById(listId: string): Promise<Tasklist> {
        const list = await this.prisma.tasklist.findUnique({
            where: { id: listId },
        })
        if (!list) throw new NotFoundException('Could not find tasklist')

        return list
    }

    async updateTasklist(
        listId: string,
        updatedTasklist: Partial<Tasklist>,
        events: EntityEvent[],
    ): Promise<void> {
        await this.prisma.tasklist.update({
            where: { id: listId },
            data: { ...updatedTasklist, events: { create: events } },
        })
    }

    async deleteTasklist(listId: string) {
        // @SCHEMA_CHANGE: Tasklist
        const lists: { id: string; parentListId: string }[] = await this.prisma.$queryRaw`
            WITH RECURSIVE all_lists_cte AS (
                SELECT id, "parentListId"
                FROM public."Tasklist"
                WHERE id = ${listId}

                UNION

                SELECT l.id, l."parentListId"
                FROM public."Tasklist" l
                    INNER JOIN all_lists_cte a ON a.id = l."parentListId"
            )
            SELECT * FROM all_lists_cte
        `
        const listIds = lists.map(list => list.id)

        const tasks = await this.prisma.task.findMany({
            where: { listId: { in: listIds } },
            select: { id: true },
        })
        const taskIds = tasks.map(task => task.id)

        const [
            { count: affectedComments },
            { count: affectedTasks },
            { count: affectedListParticipants },
            { count: affectedLists },
        ] = await this.prisma.$transaction([
            this.prisma.entityComment.deleteMany({ where: { taskId: { in: taskIds } } }),
            this.prisma.task.deleteMany({ where: { id: { in: taskIds } } }),
            this.prisma.listParticipant.deleteMany({ where: { listId: { in: listIds } } }),
            this.prisma.tasklist.deleteMany({ where: { id: { in: listIds } } }),
        ])

        return {
            affectedTasks: affectedTasks,
            affectedComments: affectedComments,
            affectedLists: affectedLists,
            affectedListParticipants: affectedListParticipants,
        }
    }

    async getTasklistEvents(listId: string) {
        const events = await this.prisma.entityEvent.findMany({
            where: { listId },
            orderBy: { timestamp: 'asc' },
        })

        // @TODO: throw db inconsistency exception here
        return entityEventSchema.array().parse(events)
    }

    async getRootLevelTasklists(userId: string) {
        const lists = await this.prisma.tasklist.findMany({
            where: {
                participants: { some: { userId } },
                parentListId: null,
            },
            select: {
                id: true,
                title: true,
                childLists: { select: { id: true } },
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return lists.map(({ childLists, ...list }) => ({
            ...list,
            childLists: childLists.map(l => l.id),
        }))
    }

    async getAllTasklistPreviews(userId: string) {
        const lists = await this.prisma.tasklist.findMany({
            where: {
                participants: { some: { userId } },
            },
            select: {
                id: true,
                parentListId: true,
                title: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return lists
    }

    async getSublists(listId: string) {
        return await this.prisma.tasklist.findMany({
            where: { parentListId: listId },
            orderBy: { createdAt: 'desc' },
        })
    }
    async getSublistsRecursive(listId: string): Promise<DbTasklist[]> {
        const allColumns = valuesOf(listTable.$columns).map(wrapInDoubleQuotes)

        // @SCHEMA_CHANGE: Tasklist
        const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
            WITH RECURSIVE all_lists AS (
                SELECT ${allColumns.join(', ')}
                FROM public."${listTable.$tableName}"
                WHERE "${listTable.id}" = '${listId}'

                UNION

                SELECT ${allColumns.map(v => 'l.' + v).join(', ')}
                FROM public."${listTable.$tableName}" l
                    INNER JOIN all_lists a ON a."${listTable.id}" = l."${listTable.parentListId}"
            )
            SELECT * FROM all_lists
        `)
        const nestedSublists = listTable.parseRows(rows)

        return nestedSublists.filter(task => task.id !== listId)
    }

    async shareTasklist(listId: string, userId: string, dto: ShareTasklistZodDto) {
        const listParticipant = await this.prisma.listParticipant.create({
            data: { listId, userId, ...dto },
        })
        return listParticipant
    }
    async updateParticipantPermissions(
        listId: string,
        participantUserId: string,
        { permission }: UpdatePermissionsZodDto,
    ) {
        const listParticipant = await this.prisma.listParticipant.findFirst({
            where: { userId: participantUserId, listId },
            select: { id: true },
        })
        if (!listParticipant) throw new NotFoundException('Could not find participant')

        return this.prisma.listParticipant.update({
            where: { id: listParticipant.id },
            data: { permission },
        })
    }
    async removeParticipant(listId: string, participantUserId: string) {
        const listParticipant = await this.prisma.listParticipant.findFirst({
            where: { userId: participantUserId, listId },
            select: { id: true },
        })
        if (!listParticipant) throw new NotFoundException('Could not find participant')

        return this.prisma.listParticipant.delete({ where: { id: listParticipant.id } })
    }

    async search(userId: string, query: string) {
        return this.prisma.tasklist.findMany({
            where: {
                participants: { some: { userId } },
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
        })
    }
}
