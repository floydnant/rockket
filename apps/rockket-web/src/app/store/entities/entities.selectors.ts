import { createFeatureSelector, createSelector } from '@ngrx/store'
import { EntitiesState } from './entities.state'
import { applySorters, sortByPriority, sortByStatus } from './utils'

export const entitiesFeature = createFeatureSelector<EntitiesState>('entities')

export const entitiesSelectors = {
    taskTreeMap: createSelector(entitiesFeature, ({ taskTreeMap }) => {
        if (!taskTreeMap) return null
        const sortedTreeMap = Object.fromEntries(
            Object.entries(taskTreeMap).map(([listId, taskTree]) => {
                return [listId, applySorters(taskTree, sortByPriority, sortByStatus)]
            })
        )

        return sortedTreeMap
    }),
}
