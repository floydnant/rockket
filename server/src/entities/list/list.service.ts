import { ForbiddenException, Injectable } from '@nestjs/common'
import { ListPermission } from '@prisma/client'
import { PermissionsService } from '../permissions/permissions.service'
import { CreateTasklistDto, ShareTasklistDto, UpdatePermissionsDto, UpdateTasklistDto } from './list.dto'
import { ListRepository } from './list.repository'

@Injectable()
export class ListService {
    constructor(private listRepository: ListRepository, private permissions: PermissionsService) {}

    createTaskList(userId: string, dto: CreateTasklistDto) {
        return this.listRepository.createTasklist(userId, dto)
    }
    async getTasklist(userId: string, listId: string) {
        const hasPermissions = await this.permissions.hasPermissionForList(
            userId,
            listId,
            ListPermission.View,
        )
        if (!hasPermissions) throw new ForbiddenException("You don't have permission to view this tasklist")

        return this.listRepository.getTasklistById(listId)
    }
    async updateTasklist(userId: string, listId: string, dto: UpdateTasklistDto) {
        const hasPermissions = await this.permissions.hasPermissionForList(
            userId,
            listId,
            ListPermission.Edit,
        )
        if (!hasPermissions) throw new ForbiddenException("You don't have permission to update this tasklist")

        return this.listRepository.updateTasklist(listId, dto)
    }
    async deletelist(userId: string, listId: string) {
        const hasPermissions = await this.permissions.hasPermissionForList(
            userId,
            listId,
            ListPermission.Edit,
        )
        if (!hasPermissions) throw new ForbiddenException("You don't have permission to delete this tasklist")

        const { tasks, taskComments, lists, listComments } = await this.listRepository.deleteTasklist(listId)
        const comments = taskComments + listComments

        const tasksPlural = tasks == 1 ? '' : 's'
        const tasksMessage = `${tasks} task${tasksPlural}`

        const listsPlural = lists == 1 ? '' : 's'

        const commentsPlural = comments == 1 ? '' : 's'
        const commentsMessage = comments ? ` and ${comments} related comment${commentsPlural}` : ''

        return {
            successMessage: `Deleted ${lists} list${listsPlural}${
                commentsMessage ? ',' : ' and'
            } ${tasksMessage}${commentsMessage}.`,
        }
    }

    async getRootLevelTasklists(userId: string) {
        return this.listRepository.getRootLevelTasklists(userId)
    }
    async getAllTasklists(userId: string) {
        return this.listRepository.getAllTasklistPreviews(userId)
    }

    async getChildTasklists(userId: string, listId: string) {
        const hasPermissions = await this.permissions.hasPermissionForList(
            userId,
            listId,
            ListPermission.View,
        )
        if (!hasPermissions) throw new ForbiddenException("You don't have permission to view this tasklist")

        return this.listRepository.getChildTasklists(listId)
    }

    async shareTasklist(userId: string, listId: string, newParticipantId: string, dto: ShareTasklistDto) {
        const hasPermissions = await this.permissions.hasPermissionForList(
            userId,
            listId,
            ListPermission.Manage,
        )
        if (!hasPermissions) throw new ForbiddenException("You don't have permission to share this tasklist")

        return this.listRepository.shareTasklist(listId, newParticipantId, dto)
    }
    async updateParticipantPermissions(
        userId: string,
        listId: string,
        participantUserId: string,
        dto: UpdatePermissionsDto,
    ) {
        const hasPermissions = await this.permissions.isListOwner(userId, listId)
        if (!hasPermissions)
            throw new ForbiddenException("You don't have permission to manage participants on this tasklist")

        return this.listRepository.updateParticipantPermissions(listId, participantUserId, dto)
    }
    async removeParticipant(userId: string, listId: string, participantUserId: string) {
        const hasPermissions = await this.permissions.isListOwner(userId, listId)
        if (!hasPermissions)
            throw new ForbiddenException("You don't have permission to manage participants on this tasklist")

        return this.listRepository.removeParticipant(listId, participantUserId)
    }
}
