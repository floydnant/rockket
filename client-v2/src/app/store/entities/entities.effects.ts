import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { catchError, concatMap, first, map, mergeMap, of, switchMap, tap } from 'rxjs'
import { DialogService } from 'src/app/modal/dialog.service'
import { EntityType } from 'src/app/models/entities.model'
import { EntitiesService } from 'src/app/services/entities.service'
import { getMessageFromHttpError } from 'src/app/utils/store.helpers'
import { AppState } from '..'
import { entitiesActions } from './entities.actions'
import { getEntityById, traceEntity } from './utils'

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

    loadPreviews = createEffect(() => {
        return this.actions$.pipe(
            ofType(entitiesActions.loadPreviews),
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
                    .select(state => state.entities[dto.entityType]?.[dto.id])
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
            switchMap(({ id }) => {
                return this.store
                    .select(state => state.entities.entityTree)
                    .pipe(
                        first(),
                        map(entityTree => {
                            if (!entityTree) return entitiesActions.abortRenameDialog()

                            const entity = getEntityById(entityTree, id)
                            if (!entity) return entitiesActions.abortRenameDialog()

                            const entityType = EntityType.TASKLIST // @TODO: remove hardcoded value
                            const newName = prompt(`Rename the ${entityType}`, entity.name)?.trim()
                            if (!newName) return entitiesActions.abortRenameDialog()

                            return entitiesActions.rename({ id, newName, showToast: true })
                        })
                    )
            })
        )
    })
    //
    rename = createEffect(() => {
        return this.actions$.pipe(
            ofType(entitiesActions.rename),
            mergeMap(({ id, newName, showToast }) => {
                const entityType = EntityType.TASKLIST // @TODO: remove hardcoded value
                const res$ = this.entitiesService.rename({ entityType, id, newName })

                return res$.pipe(
                    showToast
                        ? this.toast.observe({
                              loading: `Renaming ${entityType}...`,
                              success: `Renamed ${entityType}`,
                              error: getMessageFromHttpError,
                          })
                        : tap(),
                    map(() => entitiesActions.renameSuccess({ id, newName })),
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
            switchMap(({ id }) => {
                return this.store
                    .select(state => state.entities.entityTree)
                    .pipe(
                        first(),
                        concatMap(entityTree => {
                            if (!entityTree) return of(entitiesActions.abortDeleteDialog())

                            const entity = getEntityById(entityTree, id)
                            if (!entity) return of(entitiesActions.abortDeleteDialog())

                            const entityType = EntityType.TASKLIST // @TODO: remove hardcoded value
                            const closed$ = this.dialogService.confirm({
                                title: `Delete this ${entityType}?`,
                                text: `Are you sure you want to delete the ${entityType} '${entity.name}'?`,
                                buttons: [{ text: 'Cancel' }, { text: 'Delete', className: 'button--danger' }],
                            }).closed

                            return closed$.pipe(
                                map(response => {
                                    if (response == 'Delete') return entitiesActions.delete({ id })
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
            mergeMap(({ id }) => {
                const entityType = EntityType.TASKLIST // @TODO: remove hardcoded value
                const res$ = this.entitiesService.delete({ entityType, id })

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
                            map(() => entitiesActions.deleteSuccess({ id }))
                        )
                    }),
                    catchError(err => of(entitiesActions.deleteError({ ...err, id })))
                )
            })
        )
    })
}
