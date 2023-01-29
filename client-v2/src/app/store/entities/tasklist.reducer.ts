import { on } from '@ngrx/store'
import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { ReducerOns } from 'src/app/utils/store.helpers'
import { listActions } from './entities.actions'
import { EntitiesState } from './entities.state'
import { getEntityById } from './utils'

export const tasklistReducerOns: ReducerOns<EntitiesState> = [
    on(listActions.createTaskListSuccess, (state, { createdList: { parentListId, ...createdList } }): EntitiesState => {
        const listEntity: EntityPreviewRecursive = {
            ...createdList,
            entityType: EntityType.TASKLIST,
            parentId: parentListId,
            children: [],
        }

        if (!parentListId)
            return {
                ...state,
                entityTree: [...(state.entityTree || []), listEntity],
            }

        const entityTreeCopy = structuredClone(state.entityTree)
        const parentList = getEntityById(entityTreeCopy, parentListId)

        if (!parentList)
            return {
                ...state,
                entityTree: [...(state.entityTree || []), listEntity],
            }

        parentList.children?.push(listEntity)

        return {
            ...state,
            entityTree: entityTreeCopy,
        }
    }),

    on(listActions.updateDescriptionSuccess, (state, { id, newDescription }): EntitiesState => {
        const entityDetailsCopy = structuredClone(state.entityDetails) as EntitiesState['entityDetails']

        entityDetailsCopy[EntityType.TASKLIST][id] = {
            ...(entityDetailsCopy[EntityType.TASKLIST][id] || {}),
            description: newDescription,
        }

        return {
            ...state,
            entityDetails: entityDetailsCopy,
        }
    }),
]
