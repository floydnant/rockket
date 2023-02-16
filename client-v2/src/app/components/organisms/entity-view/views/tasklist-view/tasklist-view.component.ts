import { ChangeDetectionStrategy, Component, Inject } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { BehaviorSubject, combineLatest, merge } from 'rxjs'
import { distinctUntilChanged, first, map, shareReplay, switchMap, tap } from 'rxjs/operators'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TasklistDetail } from 'src/app/fullstack-shared-models/list.model'
import { AppState } from 'src/app/store'
import { entitiesSelectors } from 'src/app/store/entities/entities.selectors'
import { listActions } from 'src/app/store/entities/list/list.actions'
import { taskActions } from 'src/app/store/entities/task/task.actions'
import { EntityViewData, ENTITY_VIEW_DATA } from '../../entity-view.component'

@UntilDestroy()
@Component({
    selector: 'app-tasklist-view',
    templateUrl: './tasklist-view.component.html',
    styleUrls: ['./tasklist-view.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasklistViewComponent {
    constructor(
        @Inject(ENTITY_VIEW_DATA) private viewData: EntityViewData<TasklistDetail>,
        private store: Store<AppState>
    ) {
        // @TODO: This will be needed again when fetching stuff lazily (not the whole tree up front)
        // this.listEntity$
        //     .pipe(
        //         distinctUntilChanged((previous, current) => previous?.id == current?.id),
        //         untilDestroyed(this)
        //     )
        //     .subscribe(entity => {
        //         if (!entity) return
        //         this.store.dispatch(taskActions.loadRootLevelTasks({ listId: entity.id }))
        //     })
    }

    EntityType = EntityType

    listEntity$ = this.viewData.entity$
    detail$ = this.viewData.detail$
    options$ = this.viewData.options$

    children$ = this.listEntity$.pipe(
        map(entity => entity?.children?.filter(child => child.entityType != EntityType.TASK))
    )
    tasks$ = combineLatest([this.store.select(entitiesSelectors.taskTreeMap), this.listEntity$]).pipe(
        map(([taskTreeMap, entity]) => {
            if (!taskTreeMap || !entity) return null

            return taskTreeMap[entity.id] || []
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    description$ = this.detail$.pipe(
        map(detail => detail?.description),
        distinctUntilChanged()
    )
    isDescriptionShown$ = new BehaviorSubject(false)

    descriptionChanges$ = new BehaviorSubject<string | null>(null)
    blurEvents$ = new BehaviorSubject<FocusEvent | null>(null)

    descriptionSubscription = combineLatest([this.blurEvents$, this.description$])
        .pipe(
            tap(([blurEvent, description]) => {
                if (blurEvent) {
                    if (!description) this.isDescriptionShown$.next(false)
                }
                this.isDescriptionShown$.next(!!description)
            }),
            untilDestroyed(this)
        )
        .subscribe()

    descriptionDomState$ = merge(
        this.descriptionChanges$,
        this.description$.pipe(
            tap(() => {
                if (this.descriptionChanges$.value !== null) this.descriptionChanges$.next(null)
            })
        )
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }))

    descriptionUpdatesSubscription = this.blurEvents$
        .pipe(
            switchMap(() => combineLatest([this.descriptionChanges$, this.listEntity$]).pipe(first())),
            untilDestroyed(this)
        )
        .subscribe(([newDescription, entity]) => {
            // @TODO: Throttled updates should only be sent to the server and not update the store yet.
            // The store should only be updated when the editor is blurred.
            if (!entity || newDescription === null) return
            this.store.dispatch(listActions.updateDescription({ id: entity.id, newDescription }))
        })

    createNewSublist() {
        this.listEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(listActions.createTaskList({ parentListId: entity.id }))
        })
    }

    createTask() {
        this.listEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(taskActions.create({ listId: entity.id }))
        })
    }
}
