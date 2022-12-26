import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { catchError, map, mergeMap, of } from 'rxjs'
import { EntitiesService } from 'src/app/services/entities.service'
import { entitiesActions } from './entities.actions'

@Injectable()
export class EntitiesEffects {
    constructor(private actions$: Actions, private entitiesService: EntitiesService) {}

    loadEntityPreviews = createEffect(() => {
        return this.actions$.pipe(
            ofType(entitiesActions.loadPreviews),
            mergeMap(() => {
                const res$ = this.entitiesService.getEntityPreviews()

                return res$.pipe(
                    map(listPreviews => entitiesActions.loadPreviewsSuccess({ previews: listPreviews })),
                    catchError(err => {
                        console.error(err)
                        return of(entitiesActions.loadPreviewsError(err))
                    })
                )
            })
        )
    })
}
