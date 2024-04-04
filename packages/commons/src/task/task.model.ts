import { z } from 'zod'

// @TODO: Clean up this file

export enum TaskStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    OPEN = 'OPEN',
    BACKLOG = 'BACKLOG',
    COMPLETED = 'COMPLETED',
    NOT_PLANNED = 'DISCARDED',
}

export enum TaskPriority {
    URGENT = 'URGENT',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    NONE = 'NONE',
    LOW = 'LOW',
    OPTIONAL = 'OPTIONAL',
}

export const taskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus),
    priority: z.nativeEnum(TaskPriority),
    listId: z.string(),
    parentTaskId: z.string().optional(),
    deadline: z.date({ coerce: true }).optional(),
    blockedById: z.string().optional(),
})

export type Task = {
    id: string
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

export type TaskPreview = Pick<Task, 'id' | 'title' | 'status' | 'priority' | 'listId' | 'parentTaskId'> & {
    description: string | null
}
export type TaskDetail = Task

export type TaskPreviewRecursive = TaskPreview & { children: TaskPreviewRecursive[] | null }
export type TaskPreviewFlattend = TaskPreviewRecursive & { path: string[] }

export const statusSortingMap: Record<TaskStatus, number> = {
    [TaskStatus.IN_PROGRESS]: 0,
    [TaskStatus.IN_REVIEW]: 1,
    [TaskStatus.OPEN]: 2,
    [TaskStatus.BACKLOG]: 3,
    [TaskStatus.COMPLETED]: 4,
    [TaskStatus.NOT_PLANNED]: 5,
}

export const prioritySortingMap: Record<TaskPriority, number> = {
    [TaskPriority.URGENT]: 0,
    [TaskPriority.HIGH]: 1,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.NONE]: 3,
    [TaskPriority.LOW]: 4,
    [TaskPriority.OPTIONAL]: 5,
}

// Task comments
export type TaskComment = {
    id: string
    taskId: string
    text: string
}
