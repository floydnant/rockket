import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { catchError, map, mergeMap, of, tap } from 'rxjs'
import { DialogService } from 'src/app/modal/dialog.service'
import { ENTITY_NAME_DEFAULTS } from 'src/app/models/defaults'
import { EntityType } from 'src/app/models/entities.model'
import { ListService } from 'src/app/services/entity.services/list.service'
import { getMessageFromHttpError } from 'src/app/utils/store.helpers'
import { AppState } from '..'
import { appActions } from '../app.actions'
import { listActions } from './entities.actions'

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
                const name = dto.name || ENTITY_NAME_DEFAULTS[EntityType.TASKLIST]
                const res$ = this.listService.create({ ...dto, name })

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

    updateDescription = createEffect(() => {
        return this.actions$.pipe(
            ofType(listActions.updateDescription),
            mergeMap(dto => {
                const res$ = this.listService.update(dto.id, { description: dto.newDescription })

                return res$.pipe(
                    map(() => listActions.updateDescriptionSuccess(dto)),
                    catchError(err => {
                        this.toast.error('Failed to update description')
                        return of(listActions.updateDescriptionError({ ...err, id: dto.id }))
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
}
