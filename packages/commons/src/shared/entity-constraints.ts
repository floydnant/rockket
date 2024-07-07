import { EntityType } from '../entities.model'
import { entriesOf } from '../utils'

export const NULL_PARENT = 'NULL_PARENT'
export type NullParent = typeof NULL_PARENT

export const allowedChildEntitiesMap = {
    [EntityType.TASK]: [EntityType.TASK],
    [EntityType.TASKLIST]: [EntityType.TASK, EntityType.TASKLIST],
    [NULL_PARENT]: [EntityType.TASKLIST],
} satisfies Record<EntityType | NullParent, EntityType[]>

export const allowedParentEntitiesMap: Record<EntityType, (EntityType | NullParent)[]> = (() => {
    const map = {} as Record<EntityType, (EntityType | NullParent)[]>
    for (const [parentEntityType, childrenTypes] of entriesOf(allowedChildEntitiesMap)) {
        for (const childType of childrenTypes) {
            map[childType] ||= []
            map[childType].push(parentEntityType)
        }
    }
    return map
})()
