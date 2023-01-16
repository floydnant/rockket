import { createReducer, on } from '@ngrx/store'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TasklistDetail } from 'src/app/fullstack-shared-models/list.model'
import { TaskPreview } from 'src/app/fullstack-shared-models/task.model'
import { entitiesActions, listActions, taskActions } from './entities.actions'
import { EntitiesState } from './entities.state'
import { getParentByChildId, getEntityById, buildEntityTree } from './utils'

const initialState: EntitiesState = {
    entityTree: null,
    [EntityType.TASKLIST]: null,

    // ...(Object.fromEntries(Object.values(EntityType).map(key => [key, null])) as Record<EntityType, null>),
}

export const entitiesReducer = createReducer(
    initialState,

    on(entitiesActions.loadPreviewsSuccess, (state, { previews }) => {
        return {
            ...state,
            entityTree: buildEntityTree(previews),
        }
    }),

    on(entitiesActions.loadDetailSuccess, (state, { entityType, id, entityDetail }) => {
        return {
            ...state,
            [entityType]: {
                ...(state[entityType] || {}),
                [id]: {
                    ...(state[entityType]?.[id] || {}),
                    ...entityDetail,
                },
            },
        } as EntitiesState
    }),

    on(entitiesActions.renameSuccess, (state, { id, title }) => {
        const entityTreeCopy = structuredClone(state.entityTree)
        const entity = getEntityById(entityTreeCopy, id)
        if (!entity) return state

        entity.title = title

        return {
            ...state,
            entityTree: entityTreeCopy,
        }
    }),

    on(entitiesActions.deleteSuccess, (state, { id }) => {
        const entityTreeCopy = structuredClone(state.entityTree)
        const result = getParentByChildId(entityTreeCopy, id)
        if (!result) return state

        result.subTree.splice(result.index, 1)

        return { ...state, entityTree: entityTreeCopy }
    }),

    ////////////////////////////////// Tasklist ////////////////////////////////////
    on(listActions.createTaskListSuccess, (state, { createdList }) => {
        if (!createdList.parentListId)
            return {
                ...state,
                entityTree: [...(state.entityTree || []), { ...createdList, children: [] }],
            }

        const entityTreeCopy = structuredClone(state.entityTree)
        const parentList = getEntityById(entityTreeCopy, createdList.parentListId)

        if (!parentList)
            return {
                ...state,
                entityTree: [...(state.entityTree || []), { ...createdList, children: [] }],
            }

        parentList.children.push({ ...createdList, children: [] })

        return {
            ...state,
            entityTree: entityTreeCopy,
        }
    }),

    on(listActions.updateDescriptionSuccess, (state, { id, newDescription }) => {
        const otherTasklistDetails = state[EntityType.TASKLIST] || {}
        const previousTasklistDetail = state[EntityType.TASKLIST]?.[id] || ({} as TasklistDetail)
        return {
            ...state,
            [EntityType.TASKLIST]: {
                ...otherTasklistDetails,
                [id]: {
                    ...previousTasklistDetail,
                    description: newDescription,
                },
            },
        }
    })
)
