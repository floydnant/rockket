import {
    EntityPreviewRecursive,
    EntityType,
    TaskDetail,
    TaskPreviewRecursive,
    TasklistDetail,
} from '@rockket/commons'

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
