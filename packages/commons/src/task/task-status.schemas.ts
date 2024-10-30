import { z } from 'zod'
import { ValueOf, objKeysToEnumSchema } from '../utils'

export const TaskStatus = {
    InProgress: 'IN_PROGRESS',
    InReview: 'IN_REVIEW',
    Open: 'OPEN',
    Backlog: 'BACKLOG',
    Completed: 'COMPLETED',
    Discarded: 'DISCARDED',
} as const
export type TaskStatus = ValueOf<typeof TaskStatus>
export const taskStatusSchema = z.nativeEnum(TaskStatus)

// For backwards compatibility with the old task status values
const oldTaskStatusToTaskStatusMap = {
    Open: TaskStatus.Open,
    In_Progress: TaskStatus.InProgress,
    Completed: TaskStatus.Completed,
    Backlog: TaskStatus.Backlog,
    Not_Planned: TaskStatus.Discarded,
} satisfies Record<string, TaskStatus>
export const taskStatusBackwardsCompatibleSchema = z.union([
    taskStatusSchema,
    objKeysToEnumSchema(oldTaskStatusToTaskStatusMap).transform(
        oldTaskStatus => oldTaskStatusToTaskStatusMap[oldTaskStatus],
    ),
]) as z.Schema<TaskStatus>

export const statusSortingMap: Record<TaskStatus, number> = {
    [TaskStatus.InProgress]: 0,
    [TaskStatus.InReview]: 1,
    [TaskStatus.Open]: 2,
    [TaskStatus.Backlog]: 3,
    [TaskStatus.Completed]: 4,
    [TaskStatus.Discarded]: 5,
}

export enum TaskStatusGroup {
    Untackled = 'UNTACKLED',
    Closed = 'CLOSED',
    InProgress = 'IN_PROGRESS',
}
export const taskStatusGroupMap = {
    [TaskStatus.InProgress]: TaskStatusGroup.InProgress,
    [TaskStatus.InReview]: TaskStatusGroup.InProgress,
    [TaskStatus.Open]: TaskStatusGroup.Untackled,
    [TaskStatus.Backlog]: TaskStatusGroup.Untackled,
    [TaskStatus.Completed]: TaskStatusGroup.Closed,
    [TaskStatus.Discarded]: TaskStatusGroup.Closed,
} satisfies Record<TaskStatus, TaskStatusGroup>
