import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { TaskDetail } from '@rockket/commons'
import {
    Subject,
    combineLatest,
    distinctUntilChanged,
    distinctUntilKeyChanged,
    filter,
    first,
    map,
    merge,
    mergeWith,
    share,
    startWith,
    withLatestFrom,
} from 'rxjs'
import { EntityDescriptionComponent } from 'src/app/components/molecules/entity-description/entity-description.component'
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
    ) {}

    taskEntity$ = this.viewData.entity$
    detail$ = this.viewData.detail$
    options$ = this.viewData.options$

    description$ = this.detail$.pipe(
        map(detail => {
            if (!detail) return null
            return detail.description || ''
        }),
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
            ),
        ),
        share({ resetOnRefCountZero: true }),
    )

    task$ = combineLatest([this.viewData.entity$, this.store.select(entitiesSelectors.taskTreeMap)]).pipe(
        map(([taskEntity, taskTreeMap]) => {
            if (!taskEntity || !taskTreeMap) return null

            return getTaskById(Object.values(taskTreeMap).flat(), taskEntity.id)
        }),
    )
    createSubtask() {
        this.taskEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(taskActions.create({ parentTaskId: entity.id }))
        })
    }
}
