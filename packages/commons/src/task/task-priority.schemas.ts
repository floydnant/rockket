import { z } from 'zod'
import { ValueOf, objKeysToEnumSchema } from '../utils'

export const TaskPriority = {
    URGENT: 'URGENT',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    NONE: 'NONE',
    LOW: 'LOW',
    OPTIONAL: 'OPTIONAL',
} as const
export type TaskPriority = ValueOf<typeof TaskPriority>
export const taskPrioritySchema = z.nativeEnum(TaskPriority)

// For backwards compatibility with the old task priority values
const oldTaskPriorityToTaskPriorityMap = {
    Urgent: TaskPriority.URGENT,
    High: TaskPriority.HIGH,
    Medium: TaskPriority.MEDIUM,
    None: TaskPriority.NONE,
    Low: TaskPriority.LOW,
    Optional: TaskPriority.OPTIONAL,
} satisfies Record<string, TaskPriority>
export const taskPriorityBackwardsCompatibleSchema = z.union([
    taskPrioritySchema,
    objKeysToEnumSchema(oldTaskPriorityToTaskPriorityMap).transform(
        oldTaskPriority => oldTaskPriorityToTaskPriorityMap[oldTaskPriority],
    ),
]) as z.Schema<TaskPriority>

export const prioritySortingMap: Record<TaskPriority, number> = {
    [TaskPriority.URGENT]: 0,
    [TaskPriority.HIGH]: 1,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.NONE]: 3,
    [TaskPriority.LOW]: 4,
    [TaskPriority.OPTIONAL]: 5,
}
