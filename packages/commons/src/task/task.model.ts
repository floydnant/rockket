import { z } from 'zod'
import { ValuesOf } from '../utils'

// @TODO: Clean up this file

export const TaskStatus = {
    IN_PROGRESS: 'IN_PROGRESS',
    IN_REVIEW: 'IN_REVIEW',
    OPEN: 'OPEN',
    BACKLOG: 'BACKLOG',
    COMPLETED: 'COMPLETED',
    NOT_PLANNED: 'DISCARDED',
} as const
export type TaskStatus = ValuesOf<typeof TaskStatus>
export const taskStatusSchema = z.nativeEnum(TaskStatus)

export const TaskPriority = {
    URGENT: 'URGENT',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    NONE: 'NONE',
    LOW: 'LOW',
    OPTIONAL: 'OPTIONAL',
} as const
export type TaskPriority = ValuesOf<typeof TaskPriority>
export const taskPrioritySchema = z.nativeEnum(TaskPriority)

export const taskSchema = z.object({
    id: z.string(),
    title: z.string().min(1),
    description: z.string().nullable(),
    status: taskStatusSchema,
    priority: taskPrioritySchema,

    listId: z.string(),
    ownerId: z.string(),
    parentTaskId: z.string().nullable(),

    createdAt: z.date({ coerce: true }),
    statusUpdatedAt: z.date({ coerce: true }),

    deadline: z.date({ coerce: true }).nullable(),
})

export type Task = z.infer<typeof taskSchema>

export const taskDetailSchema = z.object({})
// @TODO: TaskDetail should (instead of just duplicating the task again) contain relationsTo, relationsFrom, comments, events
export type TaskDetail = z.infer<typeof taskDetailSchema>

export type TaskRecursive = Task & { children: TaskRecursive[] | null }
export type TaskFlattend = TaskRecursive & { path: string[] }

export const statusSortingMap: Record<TaskStatus, number> = {
    [TaskStatus.IN_PROGRESS]: 0,
    [TaskStatus.IN_REVIEW]: 1,
    [TaskStatus.OPEN]: 2,
    [TaskStatus.BACKLOG]: 3,
    [TaskStatus.COMPLETED]: 4,
    [TaskStatus.NOT_PLANNED]: 5,
}
export enum TaskStatusGroup {
    Open = 'OPEN',
    Closed = 'CLOSED',
    InProgress = 'IN_PROGRESS',
}
export const taskStatusGroupMap = {
    [TaskStatus.IN_PROGRESS]: TaskStatusGroup.InProgress,
    [TaskStatus.IN_REVIEW]: TaskStatusGroup.InProgress,
    [TaskStatus.OPEN]: TaskStatusGroup.Open,
    [TaskStatus.BACKLOG]: TaskStatusGroup.Open,
    [TaskStatus.COMPLETED]: TaskStatusGroup.Closed,
    [TaskStatus.NOT_PLANNED]: TaskStatusGroup.Closed,
} satisfies Record<TaskStatus, TaskStatusGroup>

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
