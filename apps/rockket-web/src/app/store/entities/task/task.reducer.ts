import { on } from '@ngrx/store'
import { TaskRecursive, getTaskStatusUpdatedAt } from '@rockket/commons'
import { ReducerOns } from 'src/app/utils/store.helpers'
import { EntitiesState, TaskTreeMap } from '../entities.state'
import { buildTaskTree, buildTaskTreeMap, getTaskById } from '../utils'
import { taskActions } from './task.actions'

export const taskReducerOns: ReducerOns<EntitiesState> = [
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

        const createdTaskRecursive: TaskRecursive = { ...createdTask, children: null }
        if (!createdTask.parentTaskId) newTaskTreeMap[createdTask.listId].unshift(createdTaskRecursive)
        else {
            const parentTask = getTaskById(newTaskTreeMap[createdTask.listId], createdTask.parentTaskId)
            if (!parentTask) throw new Error('Could not find parent task')

            if (parentTask.children) parentTask.children.unshift(createdTaskRecursive)
            else parentTask.children = [createdTaskRecursive]
        }

        return {
            ...state,
            taskTreeMap: newTaskTreeMap,
        }
    }),

    on(taskActions.updateStatusSuccess, (state, { id, status, listId }) => {
        const taskTreeMapCopy = structuredClone(state.taskTreeMap || {}) as TaskTreeMap

        const task = getTaskById(taskTreeMapCopy[listId], id)
        if (task) {
            task.statusUpdatedAt = getTaskStatusUpdatedAt(task, status)
            task.status = status
        }

        return {
            ...state,
            taskTreeMap: taskTreeMapCopy,
        }
    }),

    on(taskActions.updatePrioritySuccess, (state, { id, priority, listId }) => {
        const taskTreeMapCopy = structuredClone(state.taskTreeMap || {}) as TaskTreeMap

        const task = getTaskById(taskTreeMapCopy[listId], id)
        if (task) {
            task.priority = priority
        }

        return {
            ...state,
            taskTreeMap: taskTreeMapCopy,
        }
    }),

    on(taskActions.updateDescriptionSuccess, (state, { id, newDescription, listId }) => {
        const taskTreeMapCopy = structuredClone(state.taskTreeMap || {}) as TaskTreeMap

        const task = getTaskById(taskTreeMapCopy[listId], id)
        if (task) {
            task.description = newDescription
        }

        return {
            ...state,
            taskTreeMap: taskTreeMapCopy,
        }
    }),
]
