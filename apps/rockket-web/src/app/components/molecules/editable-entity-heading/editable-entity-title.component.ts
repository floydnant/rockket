import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { BehaviorSubject, distinctUntilKeyChanged, filter, first, map, of, switchMap } from 'rxjs'
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
        filter(Boolean),
        distinctUntilKeyChanged('id'),
        switchMap(({ id: entityId }) => {
            return this.loadingService.getEntityLoadingState(action => action.id == entityId)
        }),
    )

    titleUpdatesSubscription = this.titleUpdates$
        .pipe(
            filter((title): title is string => title !== null),
            switchMap(title => {
                return this.isLoading$.pipe(
                    first(),
                    switchMap(isLoading => {
                        if (!isLoading) return of(title)

                        return this.isLoading$.pipe(
                            filter(isLoading => !isLoading),
                            first(),
                            map(() => title),
                        )
                    }),
                )
            }),
            switchMap(title => {
                return this.entity$.pipe(
                    first(),
                    map(entity => {
                        if (!entity) return

                        return entitiesActions.rename({ id: entity.id, entityType: entity.entityType, title })
                    }),
                )
            }),
            filter(Boolean),
            untilDestroyed(this),
        )
        .subscribe(action => this.store.dispatch(action))

    private readonly taskStatusMenuItems = getTaskStatusMenuItems(this.store)
    taskStatusMenuItems$ = this.entity$.pipe(
        map(entity => {
            if (!entity || !('status' in entity)) return null

            return this.taskStatusMenuItems.map(useTaskForActiveStatus(entity))
        }),
    )
}
