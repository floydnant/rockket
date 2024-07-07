import { createReducer, on } from '@ngrx/store'
import {
    assertUnreachable,
    EntityPreviewRecursive,
    EntityType,
    Task,
    Tasklist,
    TaskRecursive,
    valuesOf,
} from '@rockket/commons'
import { authActions } from '../user/user.actions'
import { entitiesActions } from './entities.actions'
import { EntitiesState, TaskTreeMap } from './entities.state'
import { tasklistReducerOns } from './list/list.reducer'
import { taskReducerOns } from './task/task.reducer'
import {
    buildEntityTree,
    getEntityById,
    getParentEntityByChildIdIncludingTasks,
    getTaskById,
    visitDescendants,
} from './utils'

const initialState: EntitiesState = {
    entityTree: null,
    entityDetails: {
        [EntityType.TASKLIST]: {},
        [EntityType.TASK]: {},
    },

    taskTreeMap: null,
    events: {},

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

    on(entitiesActions.loadEventsSuccess, (state, { id, events }): EntitiesState => {
        return {
            ...state,
            events: {
                ...state.events,
                [id]: events,
            },
        }
    }),
    on(entitiesActions.appendEvents, (state, { id, events }): EntitiesState => {
        return {
            ...state,
            events: {
                ...state.events,
                [id]: [...(state.events[id] || []), ...events],
            },
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

    on(entitiesActions.moveSuccess, (state, { id, entityType, newParentId, newParentEntityType }) => {
        const entityTreeCopy = structuredClone(state.entityTree) || []
        const taskTreeMapCopy = structuredClone(state.taskTreeMap) || {}

        const taskTree = valuesOf(taskTreeMapCopy).flat()
        const task = entityType != EntityType.TASK ? undefined : getTaskById(taskTree, id)

        const entity = entityType == EntityType.TASK ? undefined : getEntityById(entityTreeCopy, id)

        // Delete the old entiity
        // @TODO: We can optimize this by checking the entityType, then calling the appropriate function and reducing the appropriate state
        const oldParentEntity = getParentEntityByChildIdIncludingTasks(entityTreeCopy, taskTreeMapCopy, id)
        if (!oldParentEntity) return state
        oldParentEntity.subTree.splice(oldParentEntity.index, 1)

        // Recreate in the new parent
        entityTypeSwitch: {
            if (entityType == EntityType.TASK) {
                if (!task) break entityTypeSwitch

                // Tasks cannot be at the root, thus never should have a null parent
                if (newParentEntityType === null || newParentId === null) {
                    console.warn('Task cannot be at the root')
                    break entityTypeSwitch
                }

                if (newParentEntityType == EntityType.TASK) {
                    const parentTask = getTaskById(taskTree, newParentId)
                    if (!parentTask) break entityTypeSwitch

                    task.parentTaskId = newParentId
                    if (task.listId != parentTask.listId) {
                        task.listId = parentTask.listId
                        if (task.children) {
                            visitDescendants(task.children, child => {
                                child.listId = task.listId
                            })
                        }
                    }

                    parentTask.children ??= []
                    parentTask.children.unshift(task)

                    break entityTypeSwitch
                } else if (newParentEntityType == EntityType.TASKLIST) {
                    task.listId = newParentId
                    task.parentTaskId = null
                    taskTreeMapCopy[task.listId] ??= []
                    taskTreeMapCopy[task.listId].unshift(task)

                    if (task.children) {
                        visitDescendants(task.children, task => {
                            task.listId = newParentId
                        })
                    }

                    break entityTypeSwitch
                }

                assertUnreachable(newParentEntityType)
                break entityTypeSwitch
            }
            if (entityType == EntityType.TASKLIST) {
                if (!entity) break entityTypeSwitch

                if (newParentId === null) {
                    entity.parentId = newParentId
                    entityTreeCopy.unshift(entity)

                    break entityTypeSwitch
                }

                const parentEntity = getEntityById(entityTreeCopy, newParentId)
                if (!parentEntity) {
                    break entityTypeSwitch
                }

                entity.parentId = newParentId
                parentEntity.children ??= []
                parentEntity.children.unshift(entity)

                break entityTypeSwitch
            }

            assertUnreachable(entityType)
        }

        return {
            ...state,
            entityTree: entityTreeCopy,
            taskTreeMap: taskTreeMapCopy,
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
                // Update details
                entityDetailsCopy[entityType][entity.id] = {
                    ...(entityDetailsCopy[entityType][entity.id] || {}),
                    ...entity,
                }

                // @FIXME: we actually do need to build the trees here, because the entities are not guaranteed to be in the correct order

                // update task tree
                if (entityType == EntityType.TASK) {
                    const task = entity as Task
                    let containingArr: TaskRecursive[]

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

                // Update list tree
                if (entityType == EntityType.TASKLIST) {
                    const list = entity as Tasklist
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
    }),
)
