import { EntityType, TaskPriority, TaskStatus, TaskStatusGroup } from '@rockket/commons'
import { TwColorClass, taskPriorityColorMap, taskStatusColorMap } from '../../../../shared/colors'
import { concatMatchingKeys, flattenObject } from '../../../../utils'

export enum EntityState {
    DEFAULT = 'Default',
    LOADING = 'Loading',
    ERROR = 'Error',
}

export const entityStateIcons = {
    [EntityState.LOADING]: 'far fa-spinner-third animate-spin text-tinted-200',
    [EntityState.ERROR]: 'fas fa-times-circle text-danger-400',
} as const

export const taskStatusIconMap: Record<TaskStatus, string> = concatMatchingKeys(
    {
        [TaskStatus.Open]: 'far fa-circle',
        [TaskStatus.InProgress]: 'far fa-clock',
        [TaskStatus.InReview]: 'far fa-record-vinyl',
        [TaskStatus.Backlog]: 'fal fa-bullseye',
        [TaskStatus.Completed]: 'fas fa-check-circle',
        [TaskStatus.Discarded]: 'fas fa-minus-circle',
    } satisfies Record<TaskStatus, string>,
    {
        [TaskStatus.Open]: taskStatusColorMap[TaskStatus.Open].icon,
        [TaskStatus.InProgress]: taskStatusColorMap[TaskStatus.InProgress].icon,
        [TaskStatus.InReview]: taskStatusColorMap[TaskStatus.InReview].icon,
        [TaskStatus.Backlog]: taskStatusColorMap[TaskStatus.Backlog].icon,
        [TaskStatus.Completed]: taskStatusColorMap[TaskStatus.Completed].icon,
        [TaskStatus.Discarded]: taskStatusColorMap[TaskStatus.Discarded].icon,
    } satisfies Record<TaskStatus, TwColorClass>,
)
export const taskStatusLabelMap = {
    [TaskStatus.Open]: 'To Do',
    [TaskStatus.InProgress]: 'In Progress',
    [TaskStatus.InReview]: 'In Review',
    [TaskStatus.Backlog]: 'Backlog',
    [TaskStatus.Completed]: 'Completed',
    [TaskStatus.Discarded]: 'Discarded',
} as const satisfies Record<TaskStatus, string>

export const taskStatusGroupLabelMap = {
    [TaskStatusGroup.Untackled]: 'Untackled',
    [TaskStatusGroup.InProgress]: 'In Progress',
    [TaskStatusGroup.Closed]: 'Closed',
} as const satisfies Record<TaskStatusGroup, string>

export const taskPriorityIconMap: Record<TaskPriority, string> = concatMatchingKeys(
    {
        [TaskPriority.Urgent]: 'fas fa-chevron-double-up',
        [TaskPriority.High]: 'fas fa-chevron-up',
        [TaskPriority.Medium]: 'fas fa-equals',
        [TaskPriority.None]: 'fas fa-minus',
        [TaskPriority.Low]: 'fas fa-chevron-down',
        [TaskPriority.Optional]: 'fas fa-chevron-double-down',
    } satisfies Record<TaskPriority, string>,
    taskPriorityColorMap,
)
export const taskPriorityLabelMap = {
    [TaskPriority.Urgent]: 'Urgent',
    [TaskPriority.High]: 'High',
    [TaskPriority.Medium]: 'Medium',
    [TaskPriority.None]: 'None',
    [TaskPriority.Low]: 'Low',
    [TaskPriority.Optional]: 'Nice To Have',
} as const satisfies Record<TaskPriority, string>

const extraIcons = {
    blocking: 'far fa-ban text-tinted-300',
    description: 'far fa-sticky-note',
    plus: 'far fa-plus',
    trash: 'far fa-trash',
    edit: 'far fa-pencil-alt',
    export: 'far fa-file-export',
    clone: 'far fa-clone',
    close: 'fas fa-times',
    check: 'far fa-check',
    emptyIconSlot: 'fas fa-square opacity-0',
    expand: 'far fa-expand-alt',
    priority: 'far fa-exclamation',
    status: 'far fa-circle',
    settings: 'fas fa-cog',
    user: 'fas fa-user',
    eye: 'fas fa-eye',
    logout: 'fas fa-sign-out-alt',
    workspace: 'fas fa-garage',
    loading: 'fad fa-spinner-third animate-spin',
    image: 'fas fa-image',
    copy: 'fas fa-copy',
    markdown: 'fab fa-markdown',
    birth: 'fas fa-star',
    calendarBirth: 'far fa-calendar-star',
    calendarCheck: 'far fa-calendar-check',
    deadline: 'far fa-calendar-exclamation',
    parent: 'far fa-sitemap', // Possible other parent icons: `fa-project-diagram`, `fa-folder-tree`, `fa-network-wired`
    search: 'far fa-search',
    sort: 'fas fa-sort-alt',
    group: 'far fa-layer-group',

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

// Possible icons for 'project': `fa-tv-alt`, `th-list`, `tasks-alt`, `table`, `server`, `money-check`, `line-columns`, `list-alt`

export const defaultEntityIcons: Record<EntityType, string> = {
    [EntityType.Tasklist]: 'far fa-ballot-check text-tinted-400', // Possible other tasklist icons: `list-alt`
    [EntityType.Task]: extraIcons.status,
}

export const entityIcons = {
    [EntityType.Tasklist]: {
        [EntityState.DEFAULT]: defaultEntityIcons[EntityType.Tasklist],
        ...entityStateIcons,
    } as const,

    [EntityType.Task]: {
        [EntityState.DEFAULT]: defaultEntityIcons[EntityType.Task],
        ...entityStateIcons,
        ...taskStatusIconMap,
    } as const,
} satisfies Record<EntityType, Record<EntityState, string>>

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
