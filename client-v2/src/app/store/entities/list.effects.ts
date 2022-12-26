import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { catchError, concatMap, first, map, mergeMap, of, switchMap, tap } from 'rxjs'
import { DialogService } from 'src/app/modal/dialog.service'
import { DEFAULT_TASKLIST_NAME } from 'src/app/models/task.model'
import { ListService } from 'src/app/services/list.service'
import { getMessageFromHttpError } from 'src/app/utils/store.helpers'
import { AppState } from '..'
import { appActions } from '../app.actions'
import { listActions } from './entities.actions'
import { getEntityById, traceEntity } from './utils'

@Injectable()
export class ListEffects {
    constructor(
        private actions$: Actions,
        private listService: ListService,
        private toast: HotToastService,
        private store: Store<AppState>,
        private dialogService: DialogService,
        private router: Router
    ) {}

    createTaskList = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.createTaskList),
            mergeMap(dto => {
                const name = dto.name || DEFAULT_TASKLIST_NAME
                const res$ = this.listService.createTaskList({ ...dto, name })

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

    showRenameListDialog = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.renameListDialog),
            switchMap(({ id }) => {
                return this.store
                    .select(state => state.entities.entityTree)
                    .pipe(
                        first(),
                        map(listPreviews => {
                            if (!listPreviews) return listActions.renameListDialogAbort()

                            const taskList = getEntityById(listPreviews, id)
                            if (!taskList) return listActions.renameListDialogAbort()

                            const newName = prompt('Rename the list', taskList.name)?.trim()
                            if (!newName) return listActions.renameListDialogAbort()

                            return listActions.renameList({ id, newName })
                        })
                    )
            })
        )
    })
    //
    renameTaskList = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.renameList),
            mergeMap(({ id, newName }) => {
                const res$ = this.listService.updateTaskList(id, { name: newName })

                return res$.pipe(
                    map(() => listActions.renameListSuccess({ id, newName })),
                    catchError(err => {
                        this.toast.error(getMessageFromHttpError(err))
                        return of(listActions.renameListError(err))
                    })
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

    exportList = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.exportList),
            mergeMap(() => {
                this.toast.info('Exporting lists is not supported yet.')
                return of(appActions.nothing())
            })
        )
    })

    showDeleteListDialog = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.deleteListDialog),
            switchMap(({ id }) => {
                return this.store
                    .select(state => state.entities.entityTree)
                    .pipe(
                        first(),
                        concatMap(listPreviews => {
                            if (!listPreviews) return of(listActions.deleteListDialogAbort())

                            const taskList = getEntityById(listPreviews, id)
                            if (!taskList) return of(listActions.deleteListDialogAbort())

                            const closed$ = this.dialogService.confirm({
                                title: 'Delete this tasklist?',
                                text: `Are you sure you want to delete '${taskList.name}'?`,
                                buttons: [{ text: 'Cancel' }, { text: 'Delete', className: 'button--danger' }],
                            }).closed

                            return closed$.pipe(
                                map(response => {
                                    if (response == 'Delete') return listActions.deleteList({ id })
                                    return listActions.deleteListDialogAbort()
                                })
                            )
                        })
                    )
            })
        )
    })
    //
    deleteList = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.deleteList),
            mergeMap(({ id }) => {
                const res$ = this.listService.deleteTaskList(id)

                return res$.pipe(
                    this.toast.observe({
                        loading: 'Deleting tasklist...',
                        success: res => res.successMessage,
                        error: getMessageFromHttpError,
                    }),
                    switchMap(() => {
                        return this.activeEntityTrace$.pipe(
                            first(),
                            tap(trace => {
                                if (!trace) return

                                const activeEntity = trace[trace.length - 1]
                                if (activeEntity.id != id) return

                                const parentEntity = trace[trace.length - 2]

                                this.router.navigateByUrl(parentEntity ? `/home/${parentEntity.id}` : '/home')
                            }),
                            map(() => listActions.deleteListSuccess({ id }))
                        )
                    }),
                    catchError(err => of(listActions.deleteListError(err)))
                )
            })
        )
    })

    activeEntityTrace$ = this.store
        .select(state => state.entities.entityTree)
        .pipe(
            map(entityTree => {
                // @TODO: come up with a better solution for this
                // NOTE: using `ActivatedRoute` doesn't work in effects
                const segments = location.pathname.split('/')
                const activeId = segments[segments.length - 1]

                if (!entityTree || !activeId) return null

                return traceEntity(entityTree, activeId)
            })
        )
}
