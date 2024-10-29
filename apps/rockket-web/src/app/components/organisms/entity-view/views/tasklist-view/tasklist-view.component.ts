import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { EntityType, TasklistDetail, isTruthy } from '@rockket/commons'
import { BehaviorSubject, Subject, combineLatest, merge } from 'rxjs'
import {
    distinctUntilChanged,
    distinctUntilKeyChanged,
    filter,
    first,
    map,
    mergeWith,
    shareReplay,
    skip,
    startWith,
    withLatestFrom,
} from 'rxjs/operators'
import { UiStateService } from 'src/app/services/ui-state.service'
import { EntityDescriptionComponent } from '../../../../../components/molecules/entity-description/entity-description.component'
import { AppState } from '../../../../../store'
import { entitiesSelectors } from '../../../../../store/entities/entities.selectors'
import { listActions } from '../../../../../store/entities/list/list.actions'
import { taskActions } from '../../../../../store/entities/task/task.actions'
import { entitySortingCompareFns } from '../../../../../store/entities/utils'
import { isNotNullish, moveToMacroQueue } from '../../../../../utils'
import { ENTITY_VIEW_DATA, EntityViewData } from '../../entity-view.component'
import { TaskSortingStrategyKey, sortingStrategies } from '../../shared/sorting/task-sorting-strategies'

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
        private store: Store<AppState>,
        private uiState: UiStateService,
    ) {}

    EntityType = EntityType

    listEntity$ = this.viewData.entity$
    detail$ = this.viewData.detail$
    options$ = this.viewData.options$
    entityWithDetail$ = combineLatest([this.listEntity$, this.detail$]).pipe(
        map(([list, detail]) => {
            if (!list || !detail) return null
            return { id: list.id, createdAt: detail.createdAt }
        }),
        filter(isTruthy),
        distinctUntilKeyChanged('id'),
    )

    description$ = this.detail$.pipe(
        map(detail => {
            if (!detail) return null
            return detail.description || ''
        }),
        distinctUntilChanged(),
    )
    descriptionContext$ = this.listEntity$.pipe(
        filter(Boolean),
        distinctUntilKeyChanged('id'),
        map(entity => ({
            id: entity.id,
            description$: this.description$.pipe(filter(isNotNullish)),
        })),
    )

    private descriptionUpdateInput$ = new Subject<string>()
    updateDescription(data: { id: string; description: string }) {
        this.descriptionUpdateInput$.next(data.description)

        moveToMacroQueue(() => {
            this.store.dispatch(
                listActions.updateDescription({ id: data.id, newDescription: data.description }),
            )
        })
    }

    @ViewChild(EntityDescriptionComponent) entityDescription?: EntityDescriptionComponent
    focusDescription() {
        moveToMacroQueue(() => {
            this.entityDescription?.focus()
        })
    }

    descriptionBlurInput$ = new Subject<void>()

    private isDescriptionOpenInput$ = new Subject<boolean>()
    openDescription() {
        this.isDescriptionOpenInput$.next(true)
        moveToMacroQueue(() => this.focusDescription())
    }

    isDescriptionOpen$ = this.description$.pipe(
        map(description => Boolean(description)),
        mergeWith(this.isDescriptionOpenInput$),
        mergeWith(
            this.descriptionBlurInput$.pipe(
                withLatestFrom(merge(this.descriptionUpdateInput$.pipe(startWith(null)), this.description$)),
                map(([, description]) => Boolean(description)),
            ),
        ),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    children$ = this.listEntity$.pipe(
        map(entity => {
            return entity?.children
                ?.filter(child => child.entityType != EntityType.TASK)
                .sort(entitySortingCompareFns.byCreatedAtDesc)
        }),
        startWith(undefined),
    )
    createSublist() {
        this.listEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(listActions.createTaskList({ parentListId: entity.id }))
        })
    }

    activeSorting$ = new BehaviorSubject<TaskSortingStrategyKey>(
        this.uiState.mainViewUiState.taskSortingStrategy,
    )
    _onActiveSortingChanged = this.activeSorting$
        .pipe(skip(1), untilDestroyed(this))
        .subscribe(activeSortingKey => {
            this.uiState.setTaskSortingStrategy(activeSortingKey)
        })

    tasks$ = combineLatest([
        this.store.select(entitiesSelectors.taskTreeMap),
        this.listEntity$,
        this.activeSorting$,
    ]).pipe(
        map(([taskTreeMap, entity, activeSortingKey]) => {
            if (!taskTreeMap || !entity) return null

            const tasks = taskTreeMap[entity.id]
            if (!tasks) return []

            return sortingStrategies[activeSortingKey].sorter([...tasks])
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
    createTask() {
        this.listEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(taskActions.create({ listId: entity.id }))
        })
    }
}
