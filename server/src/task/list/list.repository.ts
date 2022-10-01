import { Injectable, NotFoundException } from '@nestjs/common'
import { ListPermission } from '@prisma/client'
import { PrismaService } from '../../prisma-abstractions/prisma.service'
import { SELECT_list_participant } from '../../prisma-abstractions/query-helpers'
import { CreateTasklistDto, ShareTasklistDto, UpdateTasklistDto } from './list.dto'

@Injectable()
export class ListRepository {
    constructor(private prisma: PrismaService) {}

    async createTasklist(userId: string, { parentListId, ...dto }: CreateTasklistDto) {
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

    async getTasklistById(userId: string, listId: string) {
        const list = await this.prisma.tasklist.findFirst({
            where: {
                id: listId,
                participants: { some: { userId } }, // @TODO: we should probably check this with `hasPermisson` in the service instead
            },
            select: {
                id: true,
                name: true,
                description: true,
                ownerId: true,
                createdAt: true,
                participants: SELECT_list_participant,
                childLists: { select: { id: true } },
                _count: { select: { tasks: true } },
            },
        })
        if (!list) throw new NotFoundException('Could not find tasklist')

        const { _count, ...restList } = list
        return {
            ...restList,
            taskCount: _count.tasks,
        }
    }

    async updateTasklist(listId: string, dto: UpdateTasklistDto) {
        return this.prisma.tasklist.update({
            where: { id: listId },
            data: dto,
        })
    }

    async deleteTasklist(listId: string) {
        await this.prisma.listParticipant.deleteMany({ where: { listId } })
        return this.prisma.tasklist.delete({ where: { id: listId } })
    }

    async getRootLevelTasklists(userId: string) {
        const lists = await this.prisma.tasklist.findMany({
            where: {
                participants: { some: { userId } },
                parentListId: null,
            },
            select: {
                id: true,
                name: true,
                childLists: { select: { id: true } },
            },
        })

        return lists.map(({ childLists, ...list }) => ({
            ...list,
            childLists: childLists.map((l) => l.id),
        }))
    }

    async getChildTasklists(listId: string) {
        return await this.prisma.tasklist.findMany({
            where: { parentListId: listId },
        })
    }

    async shareTasklist(listId: string, userId: string, dto: ShareTasklistDto) {
        const listParticipant = await this.prisma.listParticipant.create({
            data: { listId, userId, ...dto },
        })
        return listParticipant
    }

    async hasPermission(userId: string, listId: string, requiredPermission: ListPermission) {
        const permissonsRankingMap: Record<ListPermission, number> = {
            [ListPermission.Manage]: 4,
            [ListPermission.Edit]: 3,
            [ListPermission.Comment]: 2,
            [ListPermission.View]: 1,
        }

        const listParticipant = await this.prisma.listParticipant.findFirst({
            where: { userId, listId },
            select: { permission: true },
        })

        if (
            !listParticipant ||
            permissonsRankingMap[requiredPermission] > permissonsRankingMap[listParticipant.permission]
        )
            return false

        return true
    }
}
