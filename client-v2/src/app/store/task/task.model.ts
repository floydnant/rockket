import { TasklistPreview } from 'src/app/models/task.model'

export type TaskListPreviewRecursive = Omit<TasklistPreview, 'childLists'> & {
    childLists: TaskListPreviewRecursive[]
}

export interface TaskState {
    listPreviews: TaskListPreviewRecursive[] | null
}
