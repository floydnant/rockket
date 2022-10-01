import { Injectable, NotFoundException } from '@nestjs/common'
import { ListPermission } from '@prisma/client'
import { PrismaService } from '../../prisma-abstractions/prisma.service'

const permissonsRankingMap: Record<ListPermission, number> = {
    [ListPermission.Manage]: 4,
    [ListPermission.Edit]: 3,
    [ListPermission.Comment]: 2,
    [ListPermission.View]: 1,
}

const permissionMatches = (permission: ListPermission, requiredPermission: ListPermission) => {
    return permissonsRankingMap[permission] >= permissonsRankingMap[requiredPermission]
}

@Injectable()
export class PermissionsService {
    constructor(private prisma: PrismaService) {}

    async hasPermissionForList(userId: string, listId: string, requiredPermission: ListPermission) {
        const list = await this.prisma.tasklist.findUnique({
            where: { id: listId },
            select: {
                participants: {
                    where: { userId },
                    select: { permission: true },
                },
            },
        })

        if (!list) throw new NotFoundException('Could not find tasklist')

        const participant = list.participants[0]
        if (!participant) return false
        if (!permissionMatches(participant.permission, requiredPermission)) return false

        return true
    }

    async hasPermissionForTask(userId: string, taskId: string, requiredPermission: ListPermission) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: {
                list: {
                    select: {
                        participants: {
                            where: { userId },
                            select: { permission: true },
                        },
                    },
                },
            },
        })

        if (!task) throw new NotFoundException('Could not find task')

        const participant = task.list.participants[0]
        if (!participant) return false
        if (!permissionMatches(participant.permission, requiredPermission)) return false

        return true
    }

    async hasPermissionForComment(userId: string, commentId: string, requiresAuthorship = false) {
        const comment = await this.prisma.taskComment.findUnique({
            where: { id: commentId },
            select: {
                userId: true,
                taskId: true,
            },
        })

        if (!comment) throw new NotFoundException('Could not find comment')

        // if user is the author of the comment
        if (comment.userId == userId) return true
        if (requiresAuthorship) false

        // if the user is not the author, he must have Managing permissions for the task
        return this.hasPermissionForTask(userId, comment.taskId, ListPermission.Manage)
    }

    async isListOwner(userId: string, listId: string) {
        const list = await this.prisma.tasklist.findUnique({
            where: { id: listId },
            select: { ownerId: true },
        })
        if (!list) throw new NotFoundException('Could not find tasklist')

        return list.ownerId == userId
    }
}
