import { createReducer, on } from '@ngrx/store'
import { entitiesActions, listActions } from './entities.actions'
import { EntitiesState } from './entities.model'
import { getParentByChildId, getEntityById, getEntityTree } from './utils'

const initialState: EntitiesState = {
    entityTree: null,
}

export const entitiesReducer = createReducer(
    initialState,

    on(entitiesActions.loadPreviewsSuccess, (state, { previews }) => {
        return {
            ...state,
            entityTree: getEntityTree(previews),
        }
    }),

    on(listActions.createTaskListSuccess, (state, { createdList }) => {
        if (!createdList.parentListId)
            return {
                ...state,
                entityTree: [...(state.entityTree || []), { ...createdList, children: [] }],
            }

        const listPreviewsCopy = structuredClone(state.entityTree)
        const parentTaskList = getEntityById(listPreviewsCopy, createdList.parentListId)

        if (!parentTaskList)
            return {
                ...state,
                entityTree: [...(state.entityTree || []), { ...createdList, children: [] }],
            }

        parentTaskList.children.push({ ...createdList, children: [] })

        return {
            ...state,
            entityTree: listPreviewsCopy,
        }
    }),

    on(listActions.renameListSuccess, (state, { id, newName }) => {
        const listPreviewsCopy = structuredClone(state.entityTree)
        const list = getEntityById(listPreviewsCopy, id)
        if (!list) return state

        list.name = newName

        return {
            ...state,
            entityTree: listPreviewsCopy,
        }
    }),

    on(listActions.deleteListSuccess, (state, { id }) => {
        const listPreviewsCopy = structuredClone(state.entityTree)
        const result = getParentByChildId(listPreviewsCopy, id)
        if (!result) return state

        result.subTree.splice(result.index, 1)

        return { ...state, entityTree: listPreviewsCopy }
    })
)
