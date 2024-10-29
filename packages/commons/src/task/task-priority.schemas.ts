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
    [TaskPriority.URGENT]: 5,
    [TaskPriority.HIGH]: 4,
    [TaskPriority.MEDIUM]: 3,
    [TaskPriority.NONE]: 2,
    [TaskPriority.LOW]: 1,
    [TaskPriority.OPTIONAL]: 0,
}
