import * as colorsJson from '../../../colors.json'
import { LeavesConcatenated } from '../utils/type.helpers'
import { TaskPriority, TaskStatus } from '@rockket/commons'

export const colors = colorsJson

const colorClasses = {
    text: colorsJson,
    bg: colorsJson,
}

export const colorClassToValue = (colorClass: TwColorClass) => {
    const [_, color_, shade_] = colorClass.split('-')
    const color = color_ as keyof typeof colorsJson
    const shade = shade_ as keyof (typeof colorsJson)[typeof color]
    return colors[color][shade]
}

export type TwColorClass = LeavesConcatenated<typeof colorClasses, '-'>

export const taskStatusColorMap = {
    [TaskStatus.Open]: {
        icon: 'text-tinted-300',
        text: 'text-tinted-100',
        foregroundAsBg: 'bg-tinted-100',
        background: 'bg-tinted-800',
        backgroundHover: 'hover:bg-tinted-700',
        textOnBackground: 'text-tinted-100',
        textHoverOnBackground: 'hover:text-tinted-100',
    },
    [TaskStatus.InProgress]: {
        icon: 'text-secondary-400',
        text: 'text-secondary-400',
        foregroundAsBg: 'bg-secondary-400',
        background: 'bg-secondary-800',
        backgroundHover: 'hover:bg-secondary-700',
        textOnBackground: 'text-secondary-400',
        textHoverOnBackground: 'hover:text-secondary-300',
    },
    [TaskStatus.InReview]: {
        icon: 'text-secondary-400',
        text: 'text-secondary-400',
        foregroundAsBg: 'bg-secondary-400',
        background: 'bg-secondary-800',
        backgroundHover: 'hover:bg-secondary-700',
        textOnBackground: 'text-secondary-400',
        textHoverOnBackground: 'hover:text-secondary-300',
    },
    [TaskStatus.Backlog]: {
        icon: 'text-tinted-300',
        text: 'text-tinted-100',
        foregroundAsBg: 'bg-tinted-100',
        background: 'bg-tinted-800',
        backgroundHover: 'hover:bg-tinted-700',
        textOnBackground: 'text-tinted-100',
        textHoverOnBackground: 'hover:text-tinted-100',
    },
    [TaskStatus.Completed]: {
        icon: 'text-submit-400',
        text: 'text-submit-400',
        foregroundAsBg: 'bg-submit-400',
        background: 'bg-submit-800',
        backgroundHover: 'hover:bg-submit-700',
        textOnBackground: 'text-submit-200',
        textHoverOnBackground: 'hover:text-submit-100',
    },
    [TaskStatus.Discarded]: {
        icon: 'text-primary-300',
        text: 'text-primary-300',
        foregroundAsBg: 'bg-primary-400',
        background: 'bg-primary-700',
        backgroundHover: 'hover:bg-primary-600',
        textOnBackground: 'text-primary-200',
        textHoverOnBackground: 'hover:text-primary-100',
    },
} as const satisfies Record<
    TaskStatus,
    {
        icon: TwColorClass
        text: TwColorClass
        foregroundAsBg: TwColorClass
        background: TwColorClass
        backgroundHover: `hover:${TwColorClass}`
        textOnBackground: TwColorClass
        textHoverOnBackground: `hover:${TwColorClass}`
    }
>

export const taskPriorityColorMap = {
    [TaskPriority.LOW]: 'text-submit-400',
    [TaskPriority.OPTIONAL]: 'text-submit-400',
    [TaskPriority.NONE]: 'text-tinted-300',
    [TaskPriority.MEDIUM]: 'text-secondary-400',
    [TaskPriority.HIGH]: 'text-danger-400',
    [TaskPriority.URGENT]: 'text-danger-400',
} as const satisfies Record<TaskPriority, TwColorClass>
