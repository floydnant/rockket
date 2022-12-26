import { TasklistPreview } from 'src/app/models/task.model'

export type EntityPreviewRecursive = Omit<TasklistPreview, 'childLists'> & {
    children: EntityPreviewRecursive[]
}

// export interface EntityPreviewRecursive {
//     id: string
//     name: string
//     parentId: string | undefined
//     children: EntityPreviewRecursive[]
// }

export interface EntitiesState {
    entityTree: EntityPreviewRecursive[] | null
}
