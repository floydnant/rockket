import { createReducer, on } from '@ngrx/store'
import { listActions } from './task.actions'
import { TaskState } from './task.model'
import { getParentListByChildId, getTaskListById, getTasklistTree } from './utils'

const initialState: TaskState = {
    listPreviews: null,
}

export const taskReducer = createReducer(
    initialState,

    on(listActions.loadListPreviewsSuccess, (state, { previews }) => {
        return {
            ...state,
            listPreviews: getTasklistTree(previews),
        }
    }),

    on(listActions.createTaskListSuccess, (state, { createdList }) => {
        if (!createdList.parentListId)
            return {
                ...state,
                listPreviews: [...(state.listPreviews || []), { ...createdList, childLists: [] }],
            }

        const listPreviewsCopy = structuredClone(state.listPreviews)
        const parentTaskList = getTaskListById(listPreviewsCopy, createdList.parentListId)

        if (!parentTaskList)
            return {
                ...state,
                listPreviews: [...(state.listPreviews || []), { ...createdList, childLists: [] }],
            }

        parentTaskList.childLists.push({ ...createdList, childLists: [] })

        return {
            ...state,
            listPreviews: listPreviewsCopy,
        }
    }),

    on(listActions.renameListSuccess, (state, { id, newName }) => {
        const listPreviewsCopy = structuredClone(state.listPreviews)
        const list = getTaskListById(listPreviewsCopy, id)
        if (!list) return state

        list.name = newName

        return {
            ...state,
            listPreviews: listPreviewsCopy,
        }
    }),

    on(listActions.deleteListSuccess, (state, { id }) => {
        const listPreviewsCopy = structuredClone(state.listPreviews)
        const result = getParentListByChildId(listPreviewsCopy, id)
        if (!result) return state

        result.list.splice(result.index, 1)

        return { ...state, listPreviews: listPreviewsCopy }
    })
)
