import {
    EntityEvent,
    EntityPreviewRecursive,
    EntityType,
    TaskDetail,
    TaskRecursive,
    TasklistDetail,
} from '@rockket/commons'

export type TaskTreeMap = Record<string, TaskRecursive[]>

export interface EntitiesState {
    entityTree: EntityPreviewRecursive[] | null
    entityDetails: {
        [EntityType.TASKLIST]: Record<string, TasklistDetail>
        [EntityType.TASK]: Record<string, TaskDetail>
    } // @TODO: satisfies Record<EntityType, any>

    /** Mapped to their tasklist */
    taskTreeMap: TaskTreeMap | null
    events: Record<string, EntityEvent[]>

    search: { query: string } | null
}
