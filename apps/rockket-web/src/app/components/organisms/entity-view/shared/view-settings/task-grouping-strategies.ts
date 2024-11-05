import {
    taskStatusGroupMap,
    TaskStatusGroup,
    valuesOf,
    objKeysToEnumSchema,
    ValueOf,
    Task,
    TaskStatus,
    TaskPriority,
} from '@rockket/commons'
import {
    IconKey,
    taskStatusGroupLabelMap,
    taskStatusLabelMap,
    taskStatusIconMap,
    taskPriorityLabelMap,
    taskPriorityIconMap,
} from 'src/app/components/atoms/icons/icon/icons'
import { z } from 'zod'
import { TaskGroup } from '../../../task-group-tree-node/task-group-tree-node.component'

export const NOOP_GROUP_KEY = '<NOOP_GROUP>' as const

export type GroupingStrategy<
    TGroupKey extends string,
    TGroups extends Record<TGroupKey, TaskGroup> | null,
> = {
    label: string
    icon: IconKey
    groupBy: (task: Task) => TGroupKey
    groups: TGroups
}
const defineGroupingStrategy = <
    TGroupKey extends string,
    TGroups extends Record<TGroupKey, TaskGroup> | null,
>(
    definition: GroupingStrategy<TGroupKey, TGroups>,
): GroupingStrategy<TGroupKey, TGroups> => definition

export const groupingStrategies = {
    default: defineGroupingStrategy({
        label: 'No Grouping',
        icon: 'NONE',
        groupBy: () => NOOP_GROUP_KEY,
        groups: null,
    }),
    statusGroup: defineGroupingStrategy({
        label: 'Status Groups',
        icon: 'status',
        groupBy: task => taskStatusGroupMap[task.status],
        groups: {
            [TaskStatusGroup.InProgress]: {
                label: taskStatusGroupLabelMap[TaskStatusGroup.InProgress],
                icon: 'IN_PROGRESS',
            },
            [TaskStatusGroup.Untackled]: {
                label: taskStatusGroupLabelMap[TaskStatusGroup.Untackled],
                icon: 'OPEN',
            },
            [TaskStatusGroup.Closed]: {
                label: taskStatusGroupLabelMap[TaskStatusGroup.Closed],
                icon: 'COMPLETED',
            },
        },
    }),
    status: defineGroupingStrategy({
        label: 'Status',
        icon: 'status',
        groupBy: task => task.status,
        groups: valuesOf(TaskStatus).reduce((acc, status) => {
            acc[status] = {
                label: taskStatusLabelMap[status],
                icon: taskStatusIconMap[status] as IconKey,
            }
            return acc
        }, {} as Record<TaskStatus, TaskGroup>),
    }),
    priority: defineGroupingStrategy({
        label: 'Priority',
        icon: 'priority',
        groupBy: task => task.priority,
        groups: valuesOf(TaskPriority).reduce((acc, priority) => {
            acc[priority] = {
                label: taskPriorityLabelMap[priority],
                icon: taskPriorityIconMap[priority] as IconKey,
            }
            return acc
        }, {} as Record<TaskPriority, TaskGroup>),
    }),
} satisfies Record<string, GroupingStrategy<string, Record<string, TaskGroup> | null>>

export const taskGroupingStrategyKeySchema = objKeysToEnumSchema(groupingStrategies)
export type TaskGroupingStrategyKey = z.infer<typeof taskGroupingStrategyKeySchema>
export type TaskGroupKey = ReturnType<ValueOf<typeof groupingStrategies>['groupBy']>

export const DEFAULT_TASK_GROUPING_STRATEGY_KEY: TaskGroupingStrategyKey = 'default'
