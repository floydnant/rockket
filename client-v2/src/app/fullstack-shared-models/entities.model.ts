import { TaskList } from './list.model'
import { Task } from './task.model'

export enum EntityType {
    TASKLIST = 'Tasklist',
    TASK = 'Task',
    // DOCUMENT = 'Document',
    // VIEW = 'View',
}

export interface EntityPreview {
    id: string
    entityType: EntityType
    title: string
    parentId: string | undefined
}
export type EntityPreviewRecursive = EntityPreview & {
    children: EntityPreviewRecursive[] | undefined
}
export type EntityPreviewFlattend = Omit<EntityPreviewRecursive, 'children'> & {
    path: string[]
    childrenCount: number | undefined
}

export interface EntitiesSearchResultDto extends Record<EntityType, unknown> {
    [EntityType.TASK]: Task[]
    [EntityType.TASKLIST]: TaskList[]
}
