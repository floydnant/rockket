import { EntityType, TaskPriority, TaskStatus } from '@rockket/commons'
import { concatMatchingKeys, flattenObject } from 'src/app/utils'
import { taskPriorityColorMap, taskStatusColorMap } from '../../../../shared/colors'

export enum EntityState {
    DEFAULT = 'Default',
    LOADING = 'Loading',
    ERROR = 'Error',
}

const extraIcons = {
    blocking: 'far fa-ban text-tinted-300',
    description: 'far fa-sticky-note',
    plus: 'far fa-plus',
    trash: 'far fa-trash',
    edit: 'far fa-pencil-alt',
    export: 'far fa-file-export',
    clone: 'far fa-clone',
    close: 'fas fa-times',
    expand: 'far fa-expand-alt',
    priority: 'far fa-exclamation',
    status: 'far fa-dot-circle',
    settings: 'fas fa-cog',
    user: 'fas fa-user',
    eye: 'fas fa-eye',
    logout: 'fas fa-sign-out-alt',
    workspace: 'fas fa-garage',
    loading: 'fad fa-spinner-third animate-spin',
    image: 'fas fa-image',
    copy: 'fas fa-copy',
    markdown: 'fab fa-markdown',

    chevronRight: 'fas fa-chevron-right',
    chevronLeft: 'fas fa-chevron-left',
    caretDown: 'fas fa-caret-down',
    caretUp: 'fas fa-caret-up',
    ellipsisHorizontal: 'fas fa-ellipsis-h',
    ellipsisVertical: 'fas fa-ellipsis-v',

    editor: {
        undo: 'far fa-undo-alt',
        redo: 'far fa-redo-alt',
        indent: 'far fa-indent',
        outdent: 'far fa-outdent',
        paragraph: 'far fa-paragraph',
        text: 'far fa-text',
        heading: 'far fa-heading',
        heading1: 'far fa-h1',
        heading2: 'far fa-h2',
        heading3: 'far fa-h3',
        heading4: 'far fa-h4',
        bold: 'far fa-bold',
        italic: 'far fa-italic',
        strike: 'far fa-strikethrough',
        link: 'far fa-link',
        bulletList: 'far fa-list-ul',
        orderedList: 'far fa-list-ol',
        taskList: 'far fa-tasks',
        horizontalRule: 'far fa-horizontal-rule',
        code: 'far fa-code',
        codeBlock: 'far fa-laptop-code',
        quote: 'far fa-quote-right',
        table: 'fas fa-table',
    },
}

export const entityStateIcons = {
    [EntityState.LOADING]: 'far fa-spinner-third animate-spin text-tinted-200',
    [EntityState.ERROR]: 'fas fa-times-circle text-danger-400',
} as const

export const taskStatusIconMap: Record<TaskStatus, string> = concatMatchingKeys(
    {
        [TaskStatus.OPEN]: 'far fa-circle',
        [TaskStatus.IN_PROGRESS]: 'far fa-clock',
        [TaskStatus.BACKLOG]: 'fal fa-stroopwafel',
        [TaskStatus.COMPLETED]: 'fas fa-check-circle',
        [TaskStatus.NOT_PLANNED]: 'fas fa-times-circle',
    } as const,
    taskStatusColorMap,
)

export const taskPriorityIconMap: Record<TaskPriority, string> = concatMatchingKeys(
    {
        [TaskPriority.URGENT]: 'fas fa-exclamation-square',
        [TaskPriority.HIGH]: 'fas fa-exclamation-circle',
        [TaskPriority.MEDIUM]: 'fas fa-exclamation',
        [TaskPriority.NONE]: 'far fa-minus',
        [TaskPriority.OPTIONAL]: 'far fa-diamond',
    } as const,
    taskPriorityColorMap,
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
