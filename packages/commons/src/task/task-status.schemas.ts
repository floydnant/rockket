import { z } from 'zod'
import { ValueOf, objKeysToEnumSchema } from '../utils'

export const TaskStatus = {
    IN_PROGRESS: 'IN_PROGRESS',
    IN_REVIEW: 'IN_REVIEW',
    OPEN: 'OPEN',
    BACKLOG: 'BACKLOG',
    COMPLETED: 'COMPLETED',
    NOT_PLANNED: 'DISCARDED',
} as const
export type TaskStatus = ValueOf<typeof TaskStatus>
export const taskStatusSchema = z.nativeEnum(TaskStatus)

// For backwards compatibility with the old task status values
const oldTaskStatusToTaskStatusMap = {
    Open: TaskStatus.OPEN,
    In_Progress: TaskStatus.IN_PROGRESS,
    Completed: TaskStatus.COMPLETED,
    Backlog: TaskStatus.BACKLOG,
    Not_Planned: TaskStatus.NOT_PLANNED,
} satisfies Record<string, TaskStatus>
export const taskStatusBackwardsCompatibleSchema = z.union([
    taskStatusSchema,
    objKeysToEnumSchema(oldTaskStatusToTaskStatusMap).transform(
        oldTaskStatus => oldTaskStatusToTaskStatusMap[oldTaskStatus],
    ),
]) as z.Schema<TaskStatus>

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
