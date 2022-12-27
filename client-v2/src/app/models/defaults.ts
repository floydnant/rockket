import { EntityType } from './entities.model'

export const ENTITY_NAME_DEFAULTS: Record<EntityType, string> = {
    [EntityType.TASKLIST]: 'Untitled tasklist',
}

// @TODO: remove placeholder
export const DEFAULT_TASKLIST_NAME = ENTITY_NAME_DEFAULTS[EntityType.TASKLIST]
