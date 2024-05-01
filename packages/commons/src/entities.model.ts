import { Tasklist } from './list/list.schema'
import { Task } from './task/task.schema'

export enum EntityType {
    TASKLIST = 'Tasklist',
    TASK = 'Task',
    // DOCUMENT = 'Document',
    // VIEW = 'View',
}

type BaseEntityPreview = {
    id: string
    entityType: EntityType
    title: string
    parentId: string | undefined | null
}

export type TaskEntityPreview = BaseEntityPreview & { entityType: EntityType.TASK } & Task
export type TasklistEntityPreview = BaseEntityPreview & { entityType: EntityType.TASKLIST }

export type EntityPreview = TaskEntityPreview | TasklistEntityPreview

export type EntityPreviewRecursive = EntityPreview & {
    children: EntityPreviewRecursive[] | undefined
}
export type EntityPreviewFlattend = Omit<EntityPreviewRecursive, 'children'> & {
    path: string[]
    childrenCount: number | undefined
}

export type EntitiesSearchResultDto = Record<EntityType, unknown> & {
    [EntityType.TASK]: Task[]
    [EntityType.TASKLIST]: Tasklist[]
}
