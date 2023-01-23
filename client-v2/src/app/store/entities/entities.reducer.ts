import { createReducer, on } from '@ngrx/store'
import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TaskPreviewRecursive } from 'src/app/fullstack-shared-models/task.model'
import { entitiesActions, listActions, taskActions } from './entities.actions'
import { EntitiesState, TaskTreeMap } from './entities.state'
import {
    buildEntityTree,
    buildTaskTree,
    buildTaskTreeMap,
    getEntityById,
    getParentEntityByChildIdIncludingTasks,
    getTaskById,
} from './utils'

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
    on(taskActions.loadTaskPreviewsSuccess, (state, { previews }): EntitiesState => {
        return {
            ...state,
            taskTreeMap: buildTaskTreeMap(previews),
        }
    }),

    on(taskActions.loadRootLevelTasksSuccess, (state, { listId, tasks }): EntitiesState => {
        const newTaskTreeMap = { ...(structuredClone(state.taskTreeMap) || {}) } as TaskTreeMap

        newTaskTreeMap[listId] = buildTaskTree(tasks)

        return {
            ...state,
            taskTreeMap: newTaskTreeMap,
        }
    }),
    on(taskActions.createSuccess, (state, { createdTask }): EntitiesState => {
        const newTaskTreeMap = structuredClone(state.taskTreeMap || {}) as TaskTreeMap
        if (!newTaskTreeMap[createdTask.listId]) newTaskTreeMap[createdTask.listId] = []

        const createdTaskRecursive: TaskPreviewRecursive = { ...createdTask, children: null }
        if (!createdTask.parentTaskId) newTaskTreeMap[createdTask.listId].push(createdTaskRecursive)
        else {
            const parentTask = getTaskById(newTaskTreeMap[createdTask.listId], createdTask.parentTaskId)
            if (!parentTask) throw new Error('Could not find parent task')

            if (parentTask.children) parentTask.children.push(createdTaskRecursive)
            else parentTask.children = [createdTaskRecursive]
        }

        return {
            ...state,
            taskTreeMap: newTaskTreeMap,
        }
    })
)
