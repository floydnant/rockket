import colorsJson from 'colors.json'
import { TaskPriority, TaskStatus } from 'src/app/fullstack-shared-models/task.model'
import { LeavesConcatenated } from 'src/app/utils/type.helpers'

export const colors = colorsJson

const colorClasses = {
    text: colorsJson,
    bg: colorsJson,
}

export type TwColorClass = LeavesConcatenated<typeof colorClasses, '-'> // = 'text-primary-700' | 'bg-submit-400' // ...

export const taskStatusColorMap: Record<TaskStatus, TwColorClass> = {
    [TaskStatus.OPEN]: 'text-tinted-300',
    [TaskStatus.IN_PROGRESS]: 'text-secondary-400',
    [TaskStatus.BACKLOG]: 'text-tinted-300',
    [TaskStatus.COMPLETED]: 'text-submit-400',
    [TaskStatus.NOT_PLANNED]: 'text-danger-400',
} // @TODO: satisfies Record<TaskStatus, TwColorClass> as const

export const taskPriorityColorMap: Record<TaskPriority, TwColorClass> = {
    [TaskPriority.OPTIONAL]: 'text-tinted-300',
    [TaskPriority.NONE]: 'text-tinted-300',
    [TaskPriority.MEDIUM]: 'text-danger-400',
    [TaskPriority.HIGH]: 'text-danger-400',
    [TaskPriority.URGENT]: 'text-danger-400',
} // @TODO: satisfies Record<TaskPriority, TwColorClass> as const
