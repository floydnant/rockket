import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import {
    EntityPreviewRecursive,
    EntityType,
    TaskDetail,
    TaskEntityPreview,
    TaskStatus,
} from '@rockket/commons'
import {
    ReplaySubject,
    Subject,
    combineLatest,
    delay,
    distinctUntilChanged,
    distinctUntilKeyChanged,
    filter,
    first,
    map,
    merge,
    mergeWith,
    shareReplay,
    startWith,
    withLatestFrom,
} from 'rxjs'
import { taskPriorityLabelMap, taskStatusLabelMap } from 'src/app/components/atoms/icons/icon/icons'
import { EntityDescriptionComponent } from 'src/app/components/molecules/entity-description/entity-description.component'
import { UiStateService } from 'src/app/services/ui-state.service'
import { taskPriorityColorMap, taskStatusColorMap } from 'src/app/shared/colors'
import { getTaskPriorityMenuItems, getTaskStatusMenuItems } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { entitiesSelectors } from 'src/app/store/entities/entities.selectors'
import { taskActions } from 'src/app/store/entities/task/task.actions'
import { getTaskById } from 'src/app/store/entities/utils'
import { isNotNullish, moveToMacroQueue } from 'src/app/utils'
import { ENTITY_VIEW_DATA, EntityViewData } from '../../entity-view.component'

@UntilDestroy()
@Component({
    selector: 'app-task-view',
    templateUrl: './task-view.component.html',
    styleUrls: ['./task-view.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskViewComponent {
    constructor(
        @Inject(ENTITY_VIEW_DATA) private viewData: EntityViewData<TaskDetail>,
        private store: Store<AppState>,
        private uiState: UiStateService,
    ) {}

    // @TODO: make this a user setting
    allowSidepanel = true
    // @TODO: make this a user setting
    prominentStatusButton = true

    taskStatusLabelMap = taskStatusLabelMap
    statusMenuItems = getTaskStatusMenuItems(this.store)
    getStatusButtonColorClasses(status: TaskStatus) {
        return {
            [taskStatusColorMap[status].textOnBackground]: true,
            [taskStatusColorMap[status].background]: true,
            [taskStatusColorMap[status].textHoverOnBackground]: true,
            [taskStatusColorMap[status].backgroundHover]: true,
        }
    }

    taskPriorityLabelMap = taskPriorityLabelMap
    priorityColorMap = taskPriorityColorMap
    priorityMenuItems = getTaskPriorityMenuItems(this.store)

    hasSidepanel$ = new ReplaySubject<boolean>()

    taskEntity$ = this.viewData.entity$
    detail$ = this.viewData.detail$
    options$ = this.viewData.options$

    description$ = this.taskEntity$.pipe(
        filter(
            (taskEntity): taskEntity is EntityPreviewRecursive & TaskEntityPreview =>
                taskEntity?.entityType == EntityType.Task,
        ),
        map(detail => detail.description || ''),
        distinctUntilChanged(),
    )
    descriptionContext$ = this.taskEntity$.pipe(
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
                taskActions.updateDescription({ id: data.id, newDescription: data.description }),
            )
        })
    }

    @ViewChild(EntityDescriptionComponent) entityDescription?: EntityDescriptionComponent
    focusDescription() {
        moveToMacroQueue(() => {
            this.entityDescription?.focus()
        })
    }

    descriptionBlurInput$ = new Subject<null>()

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
                delay(0),
            ),
        ),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    viewSettingsStore = this.uiState.viewSettingsStore
    expandedStore = this.uiState.treeNodeExpandedStore
    descriptionExpandedStore = this.uiState.treeNodeDescriptionExpandedStore

    task$ = combineLatest([this.taskEntity$, this.store.select(entitiesSelectors.taskTreeMap)]).pipe(
        map(([taskEntity, taskTreeMap]) => {
            if (!taskEntity || !taskTreeMap) return null

            const task = getTaskById(Object.values(taskTreeMap).flat(), taskEntity.id)
            return task
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    createSubtask() {
        this.taskEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(taskActions.create({ parentTaskId: entity.id }))
        })
    }
}
