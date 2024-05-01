import { Injectable, NotFoundException } from '@nestjs/common'
import { ListPermission } from '@prisma/client'
import { EntityEvent, Tasklist } from '@rockket/commons'
import { PrismaService } from '../../prisma-abstractions/prisma.service'
import { CreateTasklistZodDto, ShareTasklistZodDto, UpdatePermissionsZodDto } from './list.dto'

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

        const transactionResult = await this.prisma.$transaction([
            this.prisma.entityEvent.deleteMany({ where: { taskId: { in: taskIds } } }),
            this.prisma.taskComment.deleteMany({ where: { taskId: { in: taskIds } } }),
            this.prisma.task.deleteMany({ where: { id: { in: taskIds } } }),
            this.prisma.listParticipant.deleteMany({ where: { listId: { in: listIds } } }),
            this.prisma.tasklist.deleteMany({ where: { id: { in: listIds } } }),
        ])

        return {
            tasks: transactionResult[2].count,
            taskEvents: transactionResult[0].count,
            taskComments: transactionResult[1].count,

            lists: transactionResult[4].count,
            listParticipants: transactionResult[3].count,
            listComments: 0,
        }
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

    async getChildTasklists(listId: string) {
        return await this.prisma.tasklist.findMany({
            where: { parentListId: listId },
            orderBy: { createdAt: 'desc' },
        })
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
