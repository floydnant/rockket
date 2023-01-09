import { createReducer, on } from '@ngrx/store'
import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TaskPreview } from 'src/app/fullstack-shared-models/task.model'
import { entitiesActions, listActions, taskActions } from './entities.actions'
import { EntitiesState } from './entities.state'
import { getParentEntityByChildId, getEntityById, buildEntityTree } from './utils'

const initialState: EntitiesState = {
    entityTree: null,
    entityDetails: {
        [EntityType.TASKLIST]: {},
    },

    taskTreeMap: null,
}

export const entitiesReducer = createReducer(
    initialState,

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

    on(entitiesActions.renameSuccess, (state, { id, title }): EntitiesState => {
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
        const result = getParentEntityByChildId(entityTreeCopy, id)
        if (!result) return state

        result.subTree.splice(result.index, 1)

        return { ...state, entityTree: entityTreeCopy }
    }),

    ////////////////////////////////// Tasklist ////////////////////////////////////
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

        parentList.children.push(listEntity)

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

    ////////////////////////////////// Task ////////////////////////////////////
    on(taskActions.loadRootLevelTasksSuccess, (state, { listId: id, tasks }) => {
        return {
            ...state,
            taskTreeMap: {
                ...(state.taskTreeMap || {}),
                [id]: tasks,
            },
        }
    }),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    on(taskActions.createSuccess, (state, { type, ...task }) => {
        const previousTasks: TaskPreview[] = state.taskTreeMap?.[task.listId] || []
        return {
            ...state,
            taskTreeMap: {
                ...(state.taskTreeMap || {}),
                [task.listId]: [...previousTasks, task],
            },
        }
    })
)
