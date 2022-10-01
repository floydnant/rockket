import { ForbiddenException, Injectable } from '@nestjs/common'
import { ListPermission } from '@prisma/client'
import { CreateTasklistDto, ShareTasklistDto, UpdateTasklistDto } from './list.dto'
import { ListRepository } from './list.repository'

@Injectable()
export class ListService {
    constructor(private listRepository: ListRepository) {}

    createTaskList(userId: string, dto: CreateTasklistDto) {
        return this.listRepository.createTasklist(userId, dto)
    }
    async getTasklist(userId: string, listId: string) {
        if (!(await this.listRepository.hasPermission(userId, listId, ListPermission.View)))
            throw new ForbiddenException("You don't have permission to view this tasklist")

        return this.listRepository.getTasklistById(userId, listId)
    }
    async updateTasklist(userId: string, listId: string, dto: UpdateTasklistDto) {
        if (!(await this.listRepository.hasPermission(userId, listId, ListPermission.Edit)))
            throw new ForbiddenException("You don't have permission to update this tasklist")

        return this.listRepository.updateTasklist(listId, dto)
    }
    async deletelist(userId: string, listId: string) {
        if (!(await this.listRepository.hasPermission(userId, listId, ListPermission.Edit)))
            throw new ForbiddenException("You don't have permission to delete this tasklist")

        return this.listRepository.deleteTasklist(listId)
    }

    async getRootLevelTasklists(userId: string) {
        return this.listRepository.getRootLevelTasklists(userId)
    }
    async getChildTasklists(userId: string, listId: string) {
        if (!(await this.listRepository.hasPermission(userId, listId, ListPermission.View)))
            throw new ForbiddenException("You don't have permission to view this tasklist")

        return this.listRepository.getChildTasklists(listId)
    }

    async shareTasklist(userId: string, listId: string, newParticipantId: string, dto: ShareTasklistDto) {
        if (!(await this.listRepository.hasPermission(userId, listId, ListPermission.Manage)))
            throw new ForbiddenException("You don't have permission to share this tasklist")

        return this.listRepository.shareTasklist(listId, newParticipantId, dto)
    }
}
