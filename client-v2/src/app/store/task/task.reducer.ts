import { createReducer, on } from '@ngrx/store'
import { listActions } from './task.actions'
import { TaskState } from './task.model'
import { getTasklistTree } from './utils'

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
    })
)
