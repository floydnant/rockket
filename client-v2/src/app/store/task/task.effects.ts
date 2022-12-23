import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { catchError, concatMap, map, mergeMap, of, switchMap, tap } from 'rxjs'
import { DialogService } from 'src/app/modal/dialog.service'
import { TaskService } from 'src/app/services/task.service'
import { getMessageFromHttpError } from 'src/app/utils/store.helpers'
import { AppState } from '..'
import { appActions } from '../app.actions'
import { listActions } from './task.actions'
import { getTaskListById } from './utils'

@Injectable()
export class TaskEffects {
    constructor(
        private actions$: Actions,
        private taskService: TaskService,
        private toast: HotToastService,
        private store: Store<AppState>,
        private dialogService: DialogService,
        private router: Router
    ) {}
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
                const name = dto.name || 'Untitled tasklist'
                const res$ = this.taskService.createTaskList({ ...dto, name })

                return res$.pipe(
                    this.toast.observe({
                        loading: 'Creating tasklist...',
                        success: `Created tasklist '${name}'`,
                        error: getMessageFromHttpError,
                    }),
                    map(tasklist => listActions.createTaskListSuccess({ createdList: tasklist })),
                    tap(({ createdList }) => this.router.navigate(['/home', createdList.id])),
                    catchError(err => of(listActions.createTaskListError(err)))
                )
            })
        )
    })

    renameTaskList = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.renameList),
            mergeMap(({ id, newName }) => {
                const res$ = this.taskService.updateTaskList(id, { name: newName })

                return res$.pipe(
                    this.toast.observe({
                        loading: 'Renaming tasklist...',
                        success: `Renamed tasklist to '${newName}'`,
                        error: getMessageFromHttpError,
                    }),
                    map(() => listActions.renameListSuccess({ id, newName })),
                    catchError(err => of(listActions.renameListError(err)))
                )
            })
        )
    })

    duplicateList = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.duplicateList),
            mergeMap(() => {
                this.toast.info('Duplicating lists is not supported yet.')
                return of(appActions.nothing())
            })
        )
    })

    showDeleteListDialog = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.deleteList),
            switchMap(({ id }) => {
                return this.store
                    .select(state => state.task.listPreviews)
                    .pipe(
                        concatMap(listPreviews => {
                            if (!listPreviews) return of(listActions.deleteListAbort())

                            const taskList = getTaskListById(listPreviews, id)
                            if (!taskList) return of(listActions.deleteListAbort())

                            const closed$ = this.dialogService.confirm({
                                title: 'Delete this tasklist?',
                                text: `Are you sure you want to delete '${taskList.name}'?`,
                                buttons: [{ text: 'Cancel' }, { text: 'Delete', className: 'button--danger' }],
                            }).closed

                            return closed$.pipe(
                                map(response => {
                                    if (response == 'Delete') return listActions.deleteListProceed({ id })
                                    return listActions.deleteListAbort()
                                })
                            )
                        })
                    )
            })
        )
    })
    deleteList = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.deleteListProceed),
            mergeMap(({ id }) => {
                const res$ = this.taskService.deleteTaskList(id)

                return res$.pipe(
                    this.toast.observe({
                        loading: 'Deleting tasklist...',
                        success: res => res.successMessage,
                        error: getMessageFromHttpError,
                    }),
                    map(() => listActions.deleteListSuccess({ id })),
                    catchError(err => of(listActions.deleteListError(err)))
                )
            })
        )
    })
}
