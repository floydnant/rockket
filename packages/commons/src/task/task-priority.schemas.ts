import { z } from 'zod'
import { ValueOf, objKeysToEnumSchema } from '../utils'

export const TaskPriority = {
    Urgent: 'URGENT',
    High: 'HIGH',
    Medium: 'MEDIUM',
    None: 'NONE',
    Low: 'LOW',
    Optional: 'OPTIONAL',
} as const
export type TaskPriority = ValueOf<typeof TaskPriority>
export const taskPrioritySchema = z.nativeEnum(TaskPriority)

// For backwards compatibility with the old task priority values
const oldTaskPriorityToTaskPriorityMap = {
    Urgent: TaskPriority.Urgent,
    High: TaskPriority.High,
    Medium: TaskPriority.Medium,
    None: TaskPriority.None,
    Low: TaskPriority.Low,
    Optional: TaskPriority.Optional,
} satisfies Record<string, TaskPriority>
export const taskPriorityBackwardsCompatibleSchema = z.union([
    taskPrioritySchema,
    objKeysToEnumSchema(oldTaskPriorityToTaskPriorityMap).transform(
        oldTaskPriority => oldTaskPriorityToTaskPriorityMap[oldTaskPriority],
    ),
]) as z.Schema<TaskPriority>

export const prioritySortingMap: Record<TaskPriority, number> = {
    [TaskPriority.Urgent]: 5,
    [TaskPriority.High]: 4,
    [TaskPriority.Medium]: 3,
    [TaskPriority.None]: 2,
    [TaskPriority.Low]: 1,
    [TaskPriority.Optional]: 0,
}
