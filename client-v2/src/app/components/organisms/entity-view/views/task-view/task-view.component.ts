import { ChangeDetectionStrategy, Component, Inject } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import {
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    first,
    map,
    mergeWith,
    startWith,
    Subject,
    tap,
} from 'rxjs'
import { TaskDetail } from 'src/app/fullstack-shared-models/task.model'
import { AppState } from 'src/app/store'
import { entitiesSelectors } from 'src/app/store/entities/entities.selectors'
import { taskActions } from 'src/app/store/entities/task/task.actions'
import { getTaskById } from 'src/app/store/entities/utils'
import { EntityViewData, ENTITY_VIEW_DATA } from '../../entity-view.component'

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
        private store: Store<AppState>
    ) {}

    taskEntity$ = this.viewData.entity$
    detail$ = this.viewData.detail$
    options$ = this.viewData.options$

    task$ = combineLatest([this.viewData.entity$, this.store.select(entitiesSelectors.taskTreeMap)]).pipe(
        map(([taskEntity, taskTreeMap]) => {
            if (!taskEntity || !taskTreeMap) return null

            return getTaskById(Object.values(taskTreeMap).flat(), taskEntity.id)
        })
    )

    description$ = this.detail$.pipe(
        map(detail => detail?.description),
        distinctUntilChanged()
    )
    isDescriptionShown$ = new BehaviorSubject(false)
    descriptionChanges$ = new Subject<string>()
    descriptionBlurEvents$ = new Subject<FocusEvent>()
    descriptionSubscription = combineLatest([this.description$, this.descriptionBlurEvents$.pipe(startWith(null))])
        .pipe(
            map(([description]) => description),
            mergeWith(this.descriptionChanges$),
            tap(description => this.isDescriptionShown$.next(!!description)),
            untilDestroyed(this)
        )
        .subscribe()

    onDescriptionUpdate(newDescription: string) {
        // @TODO: Throttled updates should only be sent to the server and not update the store yet.
        // The store should only be updated when the editor is blurred.
        this.taskEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(taskActions.updateDescription({ id: entity.id, newDescription }))
        })
        this.descriptionChanges$.next(newDescription)
    }

    createSubtask() {
        this.taskEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(taskActions.create({ parentTaskId: entity.id }))
        })
    }
}
