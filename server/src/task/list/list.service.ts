import { ForbiddenException, Injectable } from '@nestjs/common'
import { ListPermission } from '@prisma/client'
import { PermissionsService } from '../permissions/permissions.service'
import { CreateTasklistDto, ShareTasklistDto, UpdateTasklistDto } from './list.dto'
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

        return this.listRepository.deleteTasklist(listId)
    }

    async getRootLevelTasklists(userId: string) {
        return this.listRepository.getRootLevelTasklists(userId)
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
}
