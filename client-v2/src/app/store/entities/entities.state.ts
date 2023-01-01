import { EntityPreviewRecursive, EntityType } from 'src/app/models/entities.model'
import { TasklistDetail } from 'src/app/models/list.model'

export interface EntitiesState {
    entityTree: EntityPreviewRecursive[] | null

    [EntityType.TASKLIST]: Record<string, TasklistDetail> | null
}
