import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { catchError, map, mergeMap, of } from 'rxjs'
import { TaskService } from 'src/app/services/task.service'
import { listActions } from './task.actions'

@Injectable()
export class TaskEffects {
    constructor(private actions$: Actions, private taskService: TaskService) {}

    loadRootListPreviews = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.loadListPreviews),
            mergeMap(() => {
                const res$ = this.taskService.getRootListPreviews()

                return res$.pipe(
                    map(listPreviews => listActions.loadListPreviewsSuccess({ previews: listPreviews })),
                    catchError(err => {
                        console.error(err)
                        return of(listActions.loadListPreviewsError())
                    })
                )
            })
        )
    })
}
