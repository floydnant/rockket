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

        const entityTreeCopy = structuredClone(state.entityTree)
        const parentList = getEntityById(entityTreeCopy, createdList.parentListId)

        if (!parentList)
            return {
                ...state,
                entityTree: [...(state.entityTree || []), { ...createdList, children: [] }],
            }

        parentList.children.push({ ...createdList, children: [] })

        return {
            ...state,
            entityTree: entityTreeCopy,
        }
    }),

    on(entitiesActions.renameSuccess, (state, { id, newName }) => {
        const entityTreeCopy = structuredClone(state.entityTree)
        const entity = getEntityById(entityTreeCopy, id)
        if (!entity) return state

        entity.name = newName

        return {
            ...state,
            entityTree: entityTreeCopy,
        }
    }),

    on(entitiesActions.deleteSuccess, (state, { id }) => {
        const entityTreeCopy = structuredClone(state.entityTree)
        const result = getParentByChildId(entityTreeCopy, id)
        if (!result) return state

        result.subTree.splice(result.index, 1)

        return { ...state, entityTree: entityTreeCopy }
    })
)
