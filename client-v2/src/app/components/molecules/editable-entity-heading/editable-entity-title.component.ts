import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { BehaviorSubject, combineLatest, delay, distinctUntilChanged, filter, first, map, switchMap, tap } from 'rxjs'
import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TaskPreview } from 'src/app/fullstack-shared-models/task.model'
import { LoadingStateService } from 'src/app/services/loading-state.service'
import { ENTITY_TITLE_DEFAULTS } from 'src/app/shared/defaults'
import { getTaskStatusMenuItems } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { entitiesActions } from 'src/app/store/entities/entities.actions'
import { useTaskForActiveStatus } from 'src/app/utils/menu-item.helpers'
import { EntityState } from '../../atoms/icons/icon/icons'

@UntilDestroy()
@Component({
    selector: 'app-editable-entity-title',
    templateUrl: './editable-entity-title.component.html',
    styleUrls: ['./editable-entity-title.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableEntityTitleComponent {
    constructor(private store: Store<AppState>, private loadingService: LoadingStateService) {}

    EntityType = EntityType
    EntityState = EntityState
    ENTITY_TITLE_DEFAULTS = ENTITY_TITLE_DEFAULTS

    entity$ = new BehaviorSubject<
        (EntityPreviewRecursive & Pick<TaskPreview, 'status' | 'priority'>) | undefined | null
    >(null)
    @Input() set entity(activeEntity: EntityPreviewRecursive | undefined | null) {
        this.entity$.next(activeEntity as EntityPreviewRecursive & Pick<TaskPreview, 'status' | 'priority'>)
    }

    titleUpdates$ = new BehaviorSubject<string | null>(null)

    isLoading$ = this.entity$.pipe(
        filter(entity => !!entity),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        map(entity => entity!.id),
        distinctUntilChanged(),
        switchMap(entityId => {
            return this.loadingService.getEntityLoadingState(action => entityId == action.id)
        })
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

    private readonly taskStatusMenuItems = getTaskStatusMenuItems(this.store)
    taskStatusMenuItems$ = this.entity$.pipe(
        map(entity => {
            if (!entity || !('status' in entity)) return null

            return this.taskStatusMenuItems.map(useTaskForActiveStatus(entity))
        })
    )
}
