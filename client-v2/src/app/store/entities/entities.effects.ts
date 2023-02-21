import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { catchError, concatMap, first, map, mergeMap, Observable, of, switchMap, tap } from 'rxjs'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TaskList } from 'src/app/fullstack-shared-models/list.model'
import { Task } from 'src/app/fullstack-shared-models/task.model'
import { DialogService } from 'src/app/modal/dialog.service'
import { EntitiesService } from 'src/app/services/entities.service'
import { getMessageFromHttpError } from 'src/app/utils/store.helpers'
import { AppState } from '..'
import { entitiesActions } from './entities.actions'
import { getEntityByIdIncludingTasks, traceEntityIncludingTasks } from './utils'

@Injectable()
export class EntitiesEffects {
    constructor(
        private actions$: Actions,
        private entitiesService: EntitiesService,
        private store: Store<AppState>,
        private toast: HotToastService,
        private dialogService: DialogService,
        private router: Router
    ) {}

    activeEntityTrace$ = this.store
        .select(state => state.entities)
        .pipe(
            map(({ entityTree, taskTreeMap }) => {
                // @TODO: come up with a better solution for this
                // NOTE: using `ActivatedRoute` doesn't work in effects
                const segments = location.pathname.split('/')
                const activeId = segments[segments.length - 1]

                if (!entityTree || !taskTreeMap || !activeId) return null

                return traceEntityIncludingTasks(entityTree, taskTreeMap, activeId)
            })
        )

    loadPreviews = createEffect(() => {
        return this.actions$.pipe(
            ofType(entitiesActions.loadPreviews, entitiesActions.reloadPreviews),
            mergeMap(() => {
                const res$ = this.entitiesService.getEntityPreviews()

                return res$.pipe(
                    map(listPreviews => entitiesActions.loadPreviewsSuccess({ previews: listPreviews })),
                    catchError(err => of(entitiesActions.loadPreviewsError(err)))
                )
            })
        )
    })

    loadDetail = createEffect(() => {
        return this.actions$.pipe(
            ofType(entitiesActions.loadDetail),
            mergeMap(dto => {
                const res$ = this.store
                    .select(state => state.entities.entityDetails[dto.entityType][dto.id])
                    .pipe(
                        first(),
                        switchMap(entityDetail => {
                            if (entityDetail) return of(entityDetail)

                            return this.entitiesService.loadDetail(dto)
                        })
                    )

                return res$.pipe(
                    map(entityDetail => entitiesActions.loadDetailSuccess({ ...dto, entityDetail })),
                    catchError(err => of(entitiesActions.loadDetailError({ ...err, id: dto.id })))
                )
            })
        )
    })

    showRenameDialog = createEffect(() => {
        return this.actions$.pipe(
            ofType(entitiesActions.openRenameDialog),
            switchMap(({ id, entityType }) => {
                return this.store
                    .select(state => state.entities)
                    .pipe(
                        first(),
                        map(({ entityTree, taskTreeMap }) => {
                            if (!entityTree || !taskTreeMap) return entitiesActions.abortRenameDialog()

                            // @TODO: We can optimize this by checking the entityType and calling the appropriate function accordingly
                            const entity = getEntityByIdIncludingTasks(entityTree, taskTreeMap, id)
                            if (!entity) return entitiesActions.abortRenameDialog()

                            const title = prompt(`Rename the ${entityType}`, entity.title)?.trim()
                            if (!title) return entitiesActions.abortRenameDialog()

                            return entitiesActions.rename({ id, entityType, title, showToast: true })
                        })
                    )
            })
        )
    })
    //
    rename = createEffect(() => {
        return this.actions$.pipe(
            ofType(entitiesActions.rename),
            mergeMap(({ id, entityType, title, showToast }) => {
                const res$ = this.entitiesService.rename({ entityType, id, title }) as Observable<Task | TaskList>

                return res$.pipe(
                    showToast
                        ? this.toast.observe({
                              loading: `Renaming ${entityType}...`,
                              success: `Renamed ${entityType}`,
                              error: getMessageFromHttpError,
                          })
                        : tap(),
                    map(() => entitiesActions.renameSuccess({ id, entityType, title })),
                    catchError(err => {
                        if (!showToast) this.toast.error(getMessageFromHttpError(err))

                        return of(entitiesActions.renameError({ ...err, id }))
                    })
                )
            })
        )
    })

    showDeleteDialog = createEffect(() => {
        return this.actions$.pipe(
            ofType(entitiesActions.openDeleteDialog),
            switchMap(({ id, entityType }) => {
                return this.store
                    .select(state => state.entities)
                    .pipe(
                        first(),
                        concatMap(({ entityTree, taskTreeMap }) => {
                            if (!entityTree || !taskTreeMap) return of(entitiesActions.abortDeleteDialog())

                            // @TODO: We can optimize this by checking the entityType and calling the appropriate function accordingly
                            const entity = getEntityByIdIncludingTasks(entityTree, taskTreeMap, id)
                            if (!entity) return of(entitiesActions.abortDeleteDialog())

                            const hasChildren = (entity.children?.length || 0) > 0

                            const messages = {
                                [EntityType.TASK]: `Are you sure you want to delete '${entity.title}'${
                                    hasChildren ? ' and all its subtasks' : ''
                                }?`,
                            } as Record<EntityType, string>

                            const closed$ = this.dialogService.confirm({
                                title: `Delete this ${entityType}?`,
                                text:
                                    messages[entityType] ||
                                    `Are you sure you want to delete the ${entityType} '${entity.title}'?`,
                                buttons: [{ text: 'Cancel' }, { text: 'Delete', className: 'button--danger' }],
                            }).closed

                            return closed$.pipe(
                                map(response => {
                                    if (response == 'Delete') return entitiesActions.delete({ id, entityType })
                                    return entitiesActions.abortDeleteDialog()
                                })
                            )
                        })
                    )
            })
        )
    })
    //
    delete = createEffect(() => {
        return this.actions$.pipe(
            ofType(entitiesActions.delete),
            mergeMap(({ id, entityType }) => {
                const res$ = this.entitiesService.delete({ entityType, id })

                return res$.pipe(
                    this.toast.observe({
                        loading: `Deleting ${entityType}...`,
                        success: res => res.successMessage,
                        error: getMessageFromHttpError,
                    }),
                    switchMap(() => {
                        return this.activeEntityTrace$.pipe(
                            first(),
                            tap(trace => {
                                if (!trace) return

                                const activeEntity = trace[trace.length - 1]
                                if (activeEntity?.id != id) return

                                const parentEntity = trace[trace.length - 2]

                                this.router.navigateByUrl(parentEntity ? `/home/${parentEntity.id}` : '/home')
                            }),
                            map(() => entitiesActions.deleteSuccess({ id, entityType }))
                        )
                    }),
                    catchError(err => of(entitiesActions.deleteError({ ...err, id })))
                )
            })
        )
    })
}
