import { createReducer, on } from '@ngrx/store'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { entitiesActions } from './entities.actions'
import { EntitiesState } from './entities.state'
import { taskReducerOns } from './task.reducer'
import { tasklistReducerOns } from './tasklist.reducer'
import { buildEntityTree, getEntityById, getParentEntityByChildIdIncludingTasks, getTaskById } from './utils'

const initialState: EntitiesState = {
    entityTree: null,
    entityDetails: {
        [EntityType.TASKLIST]: {},
        [EntityType.TASK]: {},
    },

    taskTreeMap: null,
    // taskLoadingMap: {},
    // tasksLoadingForParentMap: {},
}

export const entitiesReducer = createReducer(
    initialState,

    ...tasklistReducerOns,
    ...taskReducerOns,

    on(entitiesActions.loadPreviewsSuccess, (state, { previews }): EntitiesState => {
        return {
            ...state,
            entityTree: buildEntityTree(previews),
        }
    }),

    on(entitiesActions.loadDetailSuccess, (state, { entityType, id, entityDetail }): EntitiesState => {
        const entityDetailsCopy = structuredClone(state.entityDetails) as EntitiesState['entityDetails']

        entityDetailsCopy[entityType][id] = {
            ...(entityDetailsCopy[entityType][id] || {}),
            ...entityDetail,
        }

        return {
            ...state,
            entityDetails: entityDetailsCopy,
        }
    }),

    on(entitiesActions.renameSuccess, (state, { id, title, entityType }): EntitiesState => {
        if (entityType == EntityType.TASK) {
            const taskTreeMapCopy = structuredClone(state.taskTreeMap)
            const task = getTaskById(taskTreeMapCopy, id)
            if (!task) return state

            task.title = title

            return {
                ...state,
                taskTreeMap: taskTreeMapCopy,
            }
        }

        // @TODO: We can optimize this by checking the entityType, then calling the appropriate function and reducing the appropriate state
        const entityTreeCopy = structuredClone(state.entityTree)
        const entity = getEntityById(entityTreeCopy, id)
        if (!entity) return state

        entity.title = title

        return {
            ...state,
            entityTree: entityTreeCopy,
        }
    }),

    on(entitiesActions.deleteSuccess, (state, { id }): EntitiesState => {
        const entityTreeCopy = structuredClone(state.entityTree)
        const taskTreeMapCopy = structuredClone(state.taskTreeMap)

        // @TODO: We can optimize this by checking the entityType, then calling the appropriate function and reducing the appropriate state
        const result = getParentEntityByChildIdIncludingTasks(entityTreeCopy, taskTreeMapCopy, id)
        if (!result) return state

        result.subTree.splice(result.index, 1)

        return {
            ...state,
            entityTree: entityTreeCopy,
            taskTreeMap: taskTreeMapCopy,
        }
    })
)
