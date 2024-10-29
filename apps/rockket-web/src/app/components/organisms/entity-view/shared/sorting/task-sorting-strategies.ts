import { objKeysToEnumSchema, TaskStatusGroup, taskStatusGroupMap } from '@rockket/commons'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'
import {
    applyMapperRecursive,
    applySortersRecursive,
    TaskSorter,
    taskSortingCompareFns,
} from 'src/app/store/entities/utils'
import { z } from 'zod'

export const sortingStrategies = {
    default: {
        label: 'Default',
        shortLabel: 'Default',
        icon: 'status',
        sorter: tasks =>
            applyMapperRecursive(tasks, tasks => {
                const notClosedTasks = tasks.filter(
                    task => taskStatusGroupMap[task.status] != TaskStatusGroup.Closed,
                )
                const closedTasks = tasks
                    .filter(task => taskStatusGroupMap[task.status] == TaskStatusGroup.Closed)
                    .sort(taskSortingCompareFns.byStatusUpdatedAtDesc)

                return [...notClosedTasks, ...closedTasks]
            }),
    },
    statusGroupAndPriority: {
        label: 'Status Groups and Priority',
        shortLabel: 'Status',
        icon: 'status',
        sorter: tasks =>
            applyMapperRecursive(tasks, tasks => {
                const inProgressTasks = tasks
                    .filter(task => taskStatusGroupMap[task.status] == TaskStatusGroup.InProgress)
                    .sort(taskSortingCompareFns.byPriorityDesc)
                const openTasks = tasks
                    .filter(task => taskStatusGroupMap[task.status] == TaskStatusGroup.Open)
                    .sort(taskSortingCompareFns.byPriorityDesc)
                const closedTasks = tasks
                    .filter(task => taskStatusGroupMap[task.status] == TaskStatusGroup.Closed)
                    .sort(taskSortingCompareFns.byStatusUpdatedAtDesc)

                const sortedTasks = [...inProgressTasks, ...openTasks, ...closedTasks]
                if (sortedTasks.length != tasks.length) {
                    console.warn('Task status group(s) unaccounted for in sorting')
                }

                return sortedTasks
            }),
    },
    status: {
        label: 'Status',
        shortLabel: 'Status',
        icon: 'status',
        sorter: tasks => applySortersRecursive(tasks, taskSortingCompareFns.byStatusAsc),
    },
    priorityDesc: {
        label: 'Priority (Highest first)',
        shortLabel: 'Priority',
        icon: 'priority',
        sorter: tasks => applySortersRecursive(tasks, taskSortingCompareFns.byPriorityDesc),
    },
    priorityAsc: {
        label: 'Priority (Lowest first)',
        shortLabel: 'Priority',
        icon: 'priority',
        sorter: tasks => applySortersRecursive(tasks, taskSortingCompareFns.byPriorityAsc),
    },
    createdAtDesc: {
        label: 'Created (Newest first)',
        shortLabel: 'Created',
        icon: 'calendarBirth',
        sorter: tasks => applySortersRecursive(tasks, taskSortingCompareFns.byCreatedAtDesc),
    },
    createdAtAsc: {
        label: 'Created (Oldest first)',
        shortLabel: 'Created',
        icon: 'calendarBirth',
        sorter: tasks => applySortersRecursive(tasks, taskSortingCompareFns.byCreatedAtAsc),
    },
    statusUpdatedAtDesc: {
        label: 'Status updated (Newest first)',
        shortLabel: 'Status updated',
        icon: 'calendarCheck',
        sorter: tasks => applySortersRecursive(tasks, taskSortingCompareFns.byStatusUpdatedAtDesc),
    },
    statusUpdatedAtAsc: {
        label: 'Status updated (Oldest first)',
        shortLabel: 'Status updated',
        icon: 'calendarCheck',
        sorter: tasks => applySortersRecursive(tasks, taskSortingCompareFns.byStatusUpdatedAtAsc),
    },
} satisfies Record<string, { label: string; shortLabel: string; icon: IconKey; sorter: TaskSorter }>

export const taskSortingStrategyKeySchema = objKeysToEnumSchema(sortingStrategies)
export type TaskSortingStrategyKey = z.infer<typeof taskSortingStrategyKeySchema>

export const DEFAULT_TASK_SORTING_STRATEGY_KEY: TaskSortingStrategyKey = 'default'
