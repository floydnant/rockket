import { on } from '@ngrx/store'
import { EntityPreviewRecursive, EntityType } from '@rockket/commons'
import { ReducerOns } from 'src/app/utils/store.helpers'
import { EntitiesState } from '../entities.state'
import { getEntityById } from '../utils'
import { listActions } from './list.actions'

export const tasklistReducerOns: ReducerOns<EntitiesState> = [
    on(
        listActions.createTaskListSuccess,
        (state, { createdList: { parentListId, ...createdList } }): EntitiesState => {
            const listEntity: EntityPreviewRecursive = {
                ...createdList,
                entityType: EntityType.Tasklist,
                parentId: parentListId,
                children: [],
            }

            if (!parentListId) {
                return {
                    ...state,
                    entityTree: [listEntity, ...(state.entityTree || [])],
                }
            }

            const entityTreeCopy = structuredClone(state.entityTree) || []
            const parentList = getEntityById(entityTreeCopy, parentListId)

            if (!parentList) {
                return {
                    ...state,
                    entityTree: [listEntity, ...(state.entityTree || [])],
                }
            }

            parentList.children ??= []
            parentList.children.unshift(listEntity)

            return {
                ...state,
                entityTree: entityTreeCopy,
            }
        },
    ),
        on(listActions.updateDescriptionSuccess, (state, { id, newDescription }): EntitiesState => {
            const entityDetailsCopy = structuredClone(state.entityDetails) as EntitiesState['entityDetails']

            entityDetailsCopy[EntityType.Tasklist][id] = {
                ...(entityDetailsCopy[EntityType.Tasklist][id] || {}),
                description: newDescription,
            }

            return {
                ...state,
                entityDetails: entityDetailsCopy,
            }
        }),
]
