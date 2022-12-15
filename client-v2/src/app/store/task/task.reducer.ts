import { createReducer, on } from '@ngrx/store'
import { listActions } from './task.actions'
import { TaskState } from './task.model'
import { getTaskListById, getTasklistTree } from './utils'

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
    })
)
