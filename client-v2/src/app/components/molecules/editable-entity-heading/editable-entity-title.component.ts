import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { BehaviorSubject, combineLatest, delay, filter, first, map, switchMap, tap } from 'rxjs'
import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { ENTITY_TITLE_DEFAULTS } from 'src/app/shared/defaults'
import { AppState } from 'src/app/store'
import { entitiesActions } from 'src/app/store/entities/entities.actions'
import { getLoadingUpdates } from 'src/app/utils/store.helpers'
import { PageEntityState } from '../../atoms/icons/page-entity-icon/page-entity-icon.component'

@UntilDestroy()
@Component({
    selector: 'app-editable-entity-title',
    templateUrl: './editable-entity-title.component.html',
    styleUrls: ['./editable-entity-title.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableEntityTitleComponent {
    constructor(private store: Store<AppState>, private actions$: Actions) {}

    EntityType = EntityType
    PageEntityState = PageEntityState
    ENTITY_TITLE_DEFAULTS = ENTITY_TITLE_DEFAULTS

    entity$ = new BehaviorSubject<EntityPreviewRecursive | undefined | null>(null)
    @Input() set entity(activeEntity: EntityPreviewRecursive | undefined | null) {
        this.entity$.next(activeEntity)
    }

    titleUpdates$ = new BehaviorSubject<string | null>(null)

    isLoading$ = getLoadingUpdates(
        this.actions$,
        [entitiesActions.rename, entitiesActions.renameSuccess, entitiesActions.renameError],
        action =>
            this.entity$.pipe(
                first(),
                map(entity => entity?.id == action.id)
            )
    )

    titleUpdatesSubscription = this.titleUpdates$
        .pipe(
            switchMap(title => {
                return combineLatest([this.entity$, this.isLoading$]).pipe(
                    first(),
                    tap(([entity, isLoading]) => {
                        if (!entity || !title) return

                        const action = entitiesActions.rename({ id: entity.id, entityType: entity.entityType, title })
                        if (isLoading) {
                            this.updateQueue$.next(action)
                            return
                        }

                        this.store.dispatch(action)
                    })
                )
            }),
            untilDestroyed(this)
        )
        .subscribe()

    // @TODO: we should have a better buffering mechanism, so that one stream is in charge of dispatching actions
    updateQueue$ = new BehaviorSubject<ReturnType<typeof entitiesActions.rename> | null>(null)
    queueSubscription = this.isLoading$
        .pipe(
            filter(isLoading => !isLoading),
            switchMap(() => this.updateQueue$.pipe(first())),
            delay(0), // move to macro queue
            map(queuedAction => {
                if (queuedAction === null) return

                this.store.dispatch(queuedAction)
                this.updateQueue$.next(null)
            }),
            untilDestroyed(this)
        )
        .subscribe()
}
