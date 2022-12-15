import { Injectable } from '@angular/core'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { catchError, map, mergeMap, of } from 'rxjs'
import { TaskService } from 'src/app/services/task.service'
import { getMessageFromHttpError } from 'src/app/utils/store.helpers'
import { listActions } from './task.actions'

@Injectable()
export class TaskEffects {
    constructor(private actions$: Actions, private taskService: TaskService, private toast: HotToastService) {}

    loadListPreviews = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.loadListPreviews),
            mergeMap(() => {
                const res$ = this.taskService.getListPreviews()

                return res$.pipe(
                    map(listPreviews => listActions.loadListPreviewsSuccess({ previews: listPreviews })),
                    catchError(err => {
                        console.error(err)
                        return of(listActions.loadListPreviewsError(err))
                    })
                )
            })
        )
    })

    createTaskList = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.createTaskList),
            mergeMap(dto => {
                const res$ = this.taskService.createTaskList(dto)

                return res$.pipe(
                    this.toast.observe({
                        loading: 'Creating tasklist...',
                        success: `Created tasklist '${dto.name}'`,
                        error: getMessageFromHttpError,
                    }),
                    map(tasklist => listActions.createTaskListSuccess({ createdList: tasklist })),
                    catchError(err => of(listActions.createTaskListError(err)))
                )
            })
        )
    })
}
