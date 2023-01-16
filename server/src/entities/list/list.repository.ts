import { Injectable, NotFoundException } from '@nestjs/common'
import { ListPermission } from '@prisma/client'
import { PrismaService } from '../../prisma-abstractions/prisma.service'
import { SELECT_list_participant } from '../../prisma-abstractions/query-helpers'
import { CreateTasklistDto, ShareTasklistDto, UpdatePermissionsDto, UpdateTasklistDto } from './list.dto'

@Injectable()
export class ListRepository {
    constructor(private prisma: PrismaService) {}

    async createTasklist(userId: string, { parentListId, ...dto }: CreateTasklistDto) {
        if (parentListId) await this.getTasklistById(parentListId) // throw if parentList not found

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

    async getTasklistById(listId: string) {
        const list = await this.prisma.tasklist.findUnique({
            where: { id: listId },
            select: {
                id: true,
                title: true,
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
                title: true,
                childLists: { select: { id: true } },
            },
        })

        return lists.map(({ childLists, ...list }) => ({
            ...list,
            childLists: childLists.map((l) => l.id),
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
                childLists: { select: { id: true } },
            },
        })

        // @TODO: remove this once switched from `TasklistPreview` to `EntityPreview`
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
    async updateParticipantPermissions(
        listId: string,
        participantUserId: string,
        { permission }: UpdatePermissionsDto,
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
}