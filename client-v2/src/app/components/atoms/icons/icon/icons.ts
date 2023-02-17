import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TaskPriority, TaskStatus } from 'src/app/fullstack-shared-models/task.model'
import { concatMatchingKeys, flattenObject } from 'src/app/utils'
import { taskPriorityColorMap, taskStatusColorMap } from '../../../../shared/colors'

export enum EntityState {
    DEFAULT = 'Default',
    LOADING = 'Loading',
    ERROR = 'Error',
}

const extraIcons = {
    blocking: 'far fa-ban text-tinted-300',
    plus: 'far fa-plus',
    trash: 'far fa-trash',
    edit: 'far fa-pencil-alt',
    export: 'far fa-file-export',
    clone: 'far fa-clone',
    expand: 'far fa-expand-alt',
    priority: 'far fa-exclamation',
    status: 'far fa-dot-circle',
    settings: 'fas fa-cog',
    user: 'fas fa-user',
    eye: 'fas fa-eye',
    logout: 'fas fa-sign-out-alt',
    workspace: 'fas fa-garage',
    loading: 'fad fa-spinner-third animate-spin',
}

export const entityStateIcons = {
    [EntityState.LOADING]: 'far fa-spinner-third animate-spin text-tinted-200',
    [EntityState.ERROR]: 'fas fa-times-circle text-danger-400',
} as const

export const taskStatusIconMap: Record<TaskStatus, string> = concatMatchingKeys(
    {
        [TaskStatus.OPEN]: 'far fa-circle',
        [TaskStatus.IN_PROGRESS]: 'far fa-clock',
        [TaskStatus.BACKLOG]: 'fas fa-spinner rotate-[-45deg]',
        [TaskStatus.COMPLETED]: 'fas fa-check-circle',
        [TaskStatus.NOT_PLANNED]: 'fas fa-times-circle',
    } as const,
    taskStatusColorMap
)

export const taskPriorityIconMap: Record<TaskPriority, string> = concatMatchingKeys(
    {
        [TaskPriority.URGENT]: 'fas fa-exclamation-square',
        [TaskPriority.HIGH]: 'fas fa-exclamation-circle',
        [TaskPriority.MEDIUM]: 'fas fa-exclamation',
        [TaskPriority.NONE]: 'far fa-minus',
        // [TaskPriority.OPTIONAL]: 'fas fa-question',
        [TaskPriority.OPTIONAL]: 'far fa-square rotate-45 scale-[0.8]',
    } as const,
    taskPriorityColorMap
)

export const defaultEntityIcons: Record<EntityType, string> = {
    [EntityType.TASKLIST]: 'far fa-tasks text-tinted-400',
    [EntityType.TASK]: extraIcons.status,
}

export const entityIcons = {
    [EntityType.TASKLIST]: {
        [EntityState.DEFAULT]: defaultEntityIcons[EntityType.TASKLIST],
        ...entityStateIcons,
    } as const,

    [EntityType.TASK]: {
        [EntityState.DEFAULT]: defaultEntityIcons[EntityType.TASK],
        ...entityStateIcons,
        ...taskStatusIconMap,
    } as const,
} // @TODO: satisfies Record<EntityType, Record<PageEntityState, string>>

export const iconClassesNested = {
    ...entityStateIcons,
    ...entityIcons,
    ...taskStatusIconMap,
    ...taskPriorityIconMap,
    ...extraIcons,
} as const

export const iconClasses = {
    ...flattenObject(iconClassesNested),
    ...defaultEntityIcons,
} as const
export type IconKey = keyof typeof iconClasses

export const isIconKey = (icon: string): icon is IconKey => icon in iconClasses
