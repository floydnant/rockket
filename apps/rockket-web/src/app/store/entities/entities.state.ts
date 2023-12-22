import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TasklistDetail } from 'src/app/fullstack-shared-models/list.model'
import { TaskDetail, TaskPreviewRecursive } from 'src/app/fullstack-shared-models/task.model'

export type TaskTreeMap = Record<string, TaskPreviewRecursive[]>

export interface EntitiesState {
    entityTree: EntityPreviewRecursive[] | null
    entityDetails: {
        [EntityType.TASKLIST]: Record<string, TasklistDetail>
        [EntityType.TASK]: Record<string, TaskDetail>
    } // @TODO: satisfies Record<EntityType, any>

    /** Mapped to their tasklist */
    taskTreeMap: TaskTreeMap | null

    search: { query: string } | null
}
