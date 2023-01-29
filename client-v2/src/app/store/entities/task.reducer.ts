import { on } from '@ngrx/store'
import { TaskPreviewRecursive } from 'src/app/fullstack-shared-models/task.model'
import { ReducerOns } from 'src/app/utils/store.helpers'
import { taskActions } from './entities.actions'
import { EntitiesState, TaskTreeMap } from './entities.state'
import { buildTaskTreeMap, buildTaskTree, getTaskById } from './utils'

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
    }),
]
