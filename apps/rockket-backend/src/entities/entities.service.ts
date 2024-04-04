import { Injectable } from '@nestjs/common'
import { EntityPreview, EntityType } from '@rockket/commons'
import { ListService } from './list/list.service'
import { TaskService } from './task/task.service'

@Injectable()
export class EntitiesService {
    constructor(private listService: ListService, private taskService: TaskService) {}

    async getEntityPreviews(userId: string) {
        const [tasklists] = await Promise.all([this.listService.getAllTasklists(userId)])

        const entityPreviews: EntityPreview[] = [
            ...tasklists.map<EntityPreview>(({ parentListId, ...list }) => ({
                ...list,
                entityType: EntityType.TASKLIST,
                parentId: parentListId as string | undefined,
            })),
        ]

        return entityPreviews
    }

    async search(userId: string, query: string) {
        const [lists, tasks] = await Promise.all([
            this.listService.search(userId, query),
            this.taskService.search(userId, query),
        ])

        return {
            [EntityType.TASKLIST]: lists,
            [EntityType.TASK]: tasks,
        }
    }
}
