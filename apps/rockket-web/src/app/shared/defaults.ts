import { EntityType } from '@rockket/commons'

export const ENTITY_TITLE_DEFAULTS: Record<EntityType, string> = {
    [EntityType.TASKLIST]: 'Untitled tasklist',
    [EntityType.TASK]: 'Untitled task',
}

export const uiDefaults = {
    sidebar: {
        WIDTH: 360,
    },
    mainView: {
        IS_TASK_EXPANDED: true,
        IS_TASK_DESCRIPTION_EXPANDED: false,
        SIDE_PANEL_WIDTH: 360,
    },
} as const
