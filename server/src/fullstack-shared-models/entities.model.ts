import { TasklistPreview } from "./list.model"

// @TODO: Hook up the `shared`-folder syncing functionality

export enum EntityType {
    TASKLIST = 'Tasklist',
    // TASK = 'Task',
    // DOCUMENT = 'Document',
    // VIEW = 'View',
}

// export interface EntityPreview {
//     id: string
//     type: EntityType
//     title: string
//     parentId: string | undefined
//     children: string[]
// }
// export type EntityPreviewRecursive = EntityPreview & {
//     children: EntityPreviewRecursive[]
// }
// export type EntityPreviewFlattend = Omit<EntityPreviewRecursive, 'children'> & {
//     path: string[]
//     childrenCount: number
// }

// @TODO: migrate to real Entity-interfaces above
export type EntityPreview = TasklistPreview
export type EntityPreviewRecursive = Omit<TasklistPreview, 'childLists'> & {
    children: EntityPreviewRecursive[]
}
export type EntityPreviewFlattend = Omit<EntityPreviewRecursive, 'children'> & {
    path: string[]
    childrenCount: number
}