import { EntityType } from '../fullstack-shared-models/entities.model'

export const ENTITY_TITLE_DEFAULTS: Record<EntityType, string> = {
    [EntityType.TASKLIST]: 'Untitled tasklist',
    [EntityType.TASK]: 'Untitled task',
}

export const uiDefaults = {
    mainView: {
        IS_TASK_EXPANDED: true,
        IS_TASK_DESCRIPTION_EXPANDED: false,
    },
} as const
