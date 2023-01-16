import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TasklistDetail } from 'src/app/fullstack-shared-models/list.model'
import { TaskPreview } from 'src/app/fullstack-shared-models/task.model'

export type TaskTreeMap = Record<string, TaskPreview[]>

export interface EntitiesState {
    entityTree: EntityPreviewRecursive[] | null

    [EntityType.TASKLIST]: Record<string, TasklistDetail> | null
}
