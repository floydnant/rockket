import * as colorsJson from 'colors.json'
import { LeavesConcatenated } from 'src/app/utils/type.helpers'
import { TaskPriority, TaskStatus } from '@rockket/commons'

export const colors = colorsJson

const colorClasses = {
    text: colorsJson,
    bg: colorsJson,
}

export type TwColorClass = LeavesConcatenated<typeof colorClasses, '-'> // = 'text-primary-700' | 'bg-submit-400' // ...

export const taskStatusColorMap = {
    [TaskStatus.OPEN]: 'text-tinted-300',
    [TaskStatus.IN_PROGRESS]: 'text-secondary-400',
    [TaskStatus.IN_REVIEW]: 'text-primary-300',
    [TaskStatus.BACKLOG]: 'text-tinted-300',
    [TaskStatus.COMPLETED]: 'text-submit-400',
    [TaskStatus.NOT_PLANNED]: 'text-danger-400',
} as const satisfies Record<TaskStatus, TwColorClass>

export const taskPriorityColorMap = {
    [TaskPriority.LOW]: 'text-submit-400',
    [TaskPriority.OPTIONAL]: 'text-submit-400',
    [TaskPriority.NONE]: 'text-tinted-300',
    [TaskPriority.MEDIUM]: 'text-secondary-400',
    [TaskPriority.HIGH]: 'text-danger-400',
    [TaskPriority.URGENT]: 'text-danger-400',
} as const satisfies Record<TaskPriority, TwColorClass>
