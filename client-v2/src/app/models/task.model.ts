export enum TaskStatus {
    BACKLOG = 'Backlog',
    OPEN = 'Open',
    IN_PROGRESS = 'In_Progress',
    COMPLETED = 'Completed',
    NOT_PLANNED = 'Not_Planned',
}

export const statusSortingMap: Record<TaskStatus, number> = {
    [TaskStatus.IN_PROGRESS]: 0,
    [TaskStatus.OPEN]: 1,
    [TaskStatus.BACKLOG]: 2,
    [TaskStatus.COMPLETED]: 3,
    [TaskStatus.NOT_PLANNED]: 4,
}

export enum TaskPriority {
    OPTIONAL = 'Optional',
    NONE = 'None',
    MEDIUM = 'Medium',
    HIGH = 'High',
    URGENT = 'Urgent',
}
export const prioritySortingMap: Record<TaskPriority, number> = {
    [TaskPriority.URGENT]: 0,
    [TaskPriority.HIGH]: 1,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.NONE]: 3,
    [TaskPriority.OPTIONAL]: 4,
}

export interface Task {
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority

    createdAt: string
    openedAt: string
    deadline: string
    inProgressSince: string
    closedAt: string

    ownerId: string
    listId: string
    parentTaskId: string
    blockedById: string

    subtaskIds: string[]
}

// @TODO: ITaskEvent

type TaskUpdatable = Pick<
    Task,
    'title' | 'description' | 'status' | 'priority' | 'listId' | 'parentTaskId' | 'deadline' | 'blockedById'
>
export type CreateTaskDto = Pick<TaskUpdatable, 'title'> & Partial<TaskUpdatable>
export type UpdateTaskDto = Partial<TaskUpdatable>

// Task comments
export interface TaskComment {
    id: string
    taskId: string
    text: string
}
export type CreateTaskCommentDto = Pick<TaskComment, 'text'>
export type UpdateTaskCommentDto = CreateTaskCommentDto
