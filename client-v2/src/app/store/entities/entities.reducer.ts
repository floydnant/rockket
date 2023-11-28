import { createReducer, on } from '@ngrx/store'
import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { entitiesActions } from './entities.actions'
import { EntitiesState, TaskTreeMap } from './entities.state'
import { taskReducerOns } from './task/task.reducer'
import { tasklistReducerOns } from './list/list.reducer'
import { buildEntityTree, getEntityById, getParentEntityByChildIdIncludingTasks, getTaskById } from './utils'
import { authActions } from '../user/user.actions'
import { Task, TaskPreviewRecursive } from 'src/app/fullstack-shared-models/task.model'
import { TaskList } from 'src/app/fullstack-shared-models/list.model'

const initialState: EntitiesState = {
    entityTree: null,
    entityDetails: {
        [EntityType.TASKLIST]: {},
        [EntityType.TASK]: {},
    },

    taskTreeMap: null,

    search: null,
}

export const entitiesReducer = createReducer(
    initialState,
    on(authActions.logoutProceed, (): EntitiesState => initialState),

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
            const taskTreeMapCopy = structuredClone(state.taskTreeMap) as TaskTreeMap
            const task = getTaskById(Object.values(taskTreeMapCopy).flat(), id)
            if (!task) return state

            task.title = title

            return {
                ...state,
                taskTreeMap: taskTreeMapCopy,
            }
        }

        // @TODO: We can optimize this by checking the entityType, then calling the appropriate function and reducing the appropriate state
        const entityTreeCopy = structuredClone(state.entityTree) || []
        const entity = getEntityById(entityTreeCopy, id)
        if (!entity) return state

        entity.title = title

        return {
            ...state,
            entityTree: entityTreeCopy,
        }
    }),
    on(entitiesActions.deleteSuccess, (state, { id }): EntitiesState => {
        const entityTreeCopy = structuredClone(state.entityTree) || []
        const taskTreeMapCopy = structuredClone(state.taskTreeMap) || {}

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    on(entitiesActions.search, (state, { type, ...search }): EntitiesState => {
        return { ...state, search }
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    on(entitiesActions.searchSuccess, (state, { type, ...result }): EntitiesState => {
        const entityDetailsCopy = structuredClone(state.entityDetails)
        const entityTreeCopy = structuredClone(state.entityTree) || []
        const taskTreeMapCopy = structuredClone(state.taskTreeMap) || {}

        for (const entityType_ in result) {
            const entityType = entityType_ as EntityType
            const entities = result[entityType]

            for (const entity of entities) {
                // update details
                entityDetailsCopy[entityType][entity.id] = {
                    ...(entityDetailsCopy[entityType][entity.id] || {}),
                    ...entity,
                }

                // @FIXME: we actually do need to build the trees here, because the entities are not guaranteed to be in the correct order

                // update task tree
                if (entityType == EntityType.TASK) {
                    const task = entity as Task
                    let containingArr: TaskPreviewRecursive[]

                    if (!task.parentTaskId) {
                        taskTreeMapCopy[task.listId] ??= []
                        containingArr = taskTreeMapCopy[task.listId]
                    } else {
                        const parentTask = getTaskById(taskTreeMapCopy[task.listId] || [], task.parentTaskId)
                        if (!parentTask) continue

                        parentTask.children ??= []
                        containingArr = parentTask.children
                    }

                    const index = containingArr.findIndex(child => child.id == task.id)
                    if (index == -1) containingArr.push({ ...task, children: null })
                    else containingArr[index] = { ...containingArr[index], ...task }
                }

                // update list tree
                if (entityType == EntityType.TASKLIST) {
                    const list = entity as TaskList
                    const listEntity: EntityPreviewRecursive = {
                        id: list.id,
                        title: list.title,
                        entityType: EntityType.TASKLIST,
                        parentId: list.parentListId,
                        children: [],
                    }

                    let containingArr: EntityPreviewRecursive[]

                    if (!list.parentListId) containingArr = entityTreeCopy
                    else {
                        const parentList = getEntityById(entityTreeCopy, list.parentListId)
                        if (!parentList) continue

                        parentList.children ??= []
                        containingArr = parentList.children
                    }

                    const index = containingArr.findIndex(child => child.id == list.id)
                    if (index == -1) containingArr.push(listEntity)
                    else {
                        const prevListEntity = containingArr[index]
                        containingArr[index] = {
                            ...prevListEntity,
                            ...listEntity,
                            children: prevListEntity.children,
                        }
                    }
                }
            }
        }

        return {
            ...state,
            entityDetails: entityDetailsCopy,
            entityTree: entityTreeCopy,
            taskTreeMap: taskTreeMapCopy,
        }
    })
)
