import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ListPermission } from '@prisma/client'
import { CreateTasklistResponse, UpdateTasklistResponse, buildTasklistEventsFromDto } from '@rockket/commons'
import { PermissionsService } from '../permissions/permissions.service'
import {
    CreateTasklistZodDto,
    ShareTasklistZodDto,
    UpdatePermissionsZodDto,
    UpdateTasklistZodDto,
} from './list.dto'
import { ListRepository } from './list.repository'

@Injectable()
export class ListService {
    constructor(private listRepository: ListRepository, private permissions: PermissionsService) {}

    createTaskList(userId: string, dto: CreateTasklistZodDto): Promise<CreateTasklistResponse> {
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
    async updateTasklist(
        userId: string,
        listId: string,
        dto: UpdateTasklistZodDto,
    ): Promise<UpdateTasklistResponse> {
        const hasPermissions = await this.permissions.hasPermissionForList(
            userId,
            listId,
            ListPermission.Edit,
        )
        if (!hasPermissions) throw new ForbiddenException("You don't have permission to update this tasklist")

        const tasklist = await this.listRepository.getTasklistById(listId)
        if (!tasklist) throw new NotFoundException('Could not find task')

        const tasklistEvents = buildTasklistEventsFromDto(tasklist, dto, userId)

        await this.listRepository.updateTasklist(listId, dto, tasklistEvents)

        return {
            tasklist: {
                ...tasklist,
                ...dto,
            },
            newEvents: tasklistEvents,
        }
    }
    async deletelist(userId: string, listId: string) {
        const hasPermissions = await this.permissions.hasPermissionForList(
            userId,
            listId,
            ListPermission.Edit,
        )
        if (!hasPermissions) throw new ForbiddenException("You don't have permission to delete this tasklist")

        const { affectedTasks, affectedComments, affectedLists } = await this.listRepository.deleteTasklist(
            listId,
        )

        const tasksPlural = affectedTasks == 1 ? '' : 's'
        const tasksMessage = `${affectedTasks} task${tasksPlural}`

        const listsPlural = affectedLists == 1 ? '' : 's'

        const commentsPlural = affectedComments == 1 ? '' : 's'
        const commentsMessage = affectedComments
            ? ` and ${affectedComments} related comment${commentsPlural}`
            : ''

        return {
            successMessage: `Deleted ${affectedLists} list${listsPlural}${
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
    async getTasklistEvents(userId: string, listId: string) {
        const hasPermissions = await this.permissions.hasPermissionForList(
            userId,
            listId,
            ListPermission.View,
        )
        if (!hasPermissions) throw new ForbiddenException("You don't have permission to view this tasklist")

        return this.listRepository.getTasklistEvents(listId)
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

    async shareTasklist(userId: string, listId: string, newParticipantId: string, dto: ShareTasklistZodDto) {
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
        dto: UpdatePermissionsZodDto,
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

    async search(userId: string, query: string) {
        return this.listRepository.search(userId, query)
    }
}
