import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ListPermission } from '@prisma/client'
import { PrismaService } from '../../prisma-abstractions/prisma.service'
import { CommentService } from '../comment/comment.service'

const permissonsRankingMap: Record<ListPermission, number> = {
    [ListPermission.Manage]: 4,
    [ListPermission.Edit]: 3,
    [ListPermission.Comment]: 2,
    [ListPermission.View]: 1,
}

const permissionMatches = (permission: ListPermission, requiredPermission: ListPermission) => {
    return permissonsRankingMap[permission] >= permissonsRankingMap[requiredPermission]
}

// @TODO: each entity should have their own `...AuthorizationService` instead

@Injectable()
export class PermissionsService {
    constructor(private prisma: PrismaService, private commentsService: CommentService) {}

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

    async hasPermissionForComment(userId: string, commentId: string, permission?: ListPermission) {
        const comment = await this.commentsService.getCommentById(commentId)
        if (!comment) throw new NotFoundException('Could not find comment')

        // If user is the author of the comment, they can do what ever they want
        if (comment.userId == userId) return true

        // If the user is not the author, they must have permissions for the task/list
        if (!permission) return false
        if (comment.taskId) return await this.hasPermissionForTask(userId, comment.taskId, permission)
        if (comment.listId) return await this.hasPermissionForList(userId, comment.listId, permission)

        // @TODO: throw db integrity/inconsistency exception here
        throw new InternalServerErrorException('Comment does not belong to a task or list')
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
