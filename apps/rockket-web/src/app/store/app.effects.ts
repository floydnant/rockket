import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { isTruthy, TaskStatusGroup, taskStatusGroupMap, valuesOf } from '@rockket/commons'
import { filter, tap } from 'rxjs'
import { AppState } from '.'
import { UiStateService } from '../services/ui-state.service'
import { taskActions } from './entities/task/task.actions'
import { visitDescendants } from './entities/utils'

@Injectable()
export class AppEffects {
    constructor(private actions$: Actions, private uiState: UiStateService, private store: Store<AppState>) {}

    onClosedTask = createEffect(
        () => {
            return this.actions$.pipe(
                ofType(taskActions.updateStatusSuccess),
                filter(action => taskStatusGroupMap[action.status] == TaskStatusGroup.Closed),
                tap(({ id }) => {
                    this.uiState.treeNodeExpandedStore.set(id, false)
                    this.uiState.treeNodeDescriptionExpandedStore.set(id, false)
                }),
            )
        },
        { dispatch: false },
    )

    collectGarbage = createEffect(
        () => {
            return this.actions$.pipe(
                ofType(ROOT_EFFECTS_INIT),
                tap(() => {
                    this.uiState.scheduleGarbageCollection(() => {
                        return this.store
                            .select(state => {
                                if (!state.entities.entityTree || !state.entities.taskTreeMap) return

                                const ids = new Set<string>()
                                visitDescendants(state.entities.entityTree, entity => {
                                    ids.add(entity.id)
                                })
                                visitDescendants(valuesOf(state.entities.taskTreeMap).flat(), task => {
                                    ids.add(task.id)
                                })

                                return ids
                            })
                            .pipe(filter(isTruthy))
                    })
                }),
            )
        },
        { dispatch: false },
    )
}
