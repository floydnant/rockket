import { Injectable } from '@nestjs/common'
import { EntityPreview, EntityType } from '../fullstack-shared-models/entities.model'
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
}
