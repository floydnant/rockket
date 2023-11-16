import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { Subject, combineLatest, merge } from 'rxjs'
import {
    distinctUntilChanged,
    distinctUntilKeyChanged,
    filter,
    first,
    map,
    mergeWith,
    share,
    shareReplay,
    startWith,
    withLatestFrom,
} from 'rxjs/operators'
import { EntityDescriptionComponent } from 'src/app/components/molecules/entity-description/entity-description.component'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TasklistDetail } from 'src/app/fullstack-shared-models/list.model'
import { AppState } from 'src/app/store'
import { entitiesSelectors } from 'src/app/store/entities/entities.selectors'
import { listActions } from 'src/app/store/entities/list/list.actions'
import { taskActions } from 'src/app/store/entities/task/task.actions'
import { isNotNullish, moveToMacroQueue } from 'src/app/utils'
import { ENTITY_VIEW_DATA, EntityViewData } from '../../entity-view.component'

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
    ) {}

    EntityType = EntityType

    listEntity$ = this.viewData.entity$
    detail$ = this.viewData.detail$
    options$ = this.viewData.options$

    description$ = this.detail$.pipe(
        map(detail => {
            if (!detail) return null
            return detail.description || ''
        }),
        distinctUntilChanged()
    )
    descriptionContext$ = this.listEntity$.pipe(
        filter(Boolean),
        distinctUntilKeyChanged('id'),
        map(entity => ({
            id: entity.id,
            description$: this.description$.pipe(filter(isNotNullish)),
        }))
    )

    private descriptionUpdateInput$ = new Subject<string>()
    updateDescription(data: { id: string; description: string }) {
        this.descriptionUpdateInput$.next(data.description)

        moveToMacroQueue(() => {
            this.store.dispatch(listActions.updateDescription({ id: data.id, newDescription: data.description }))
        })
    }

    @ViewChild(EntityDescriptionComponent) entityDescription?: EntityDescriptionComponent
    focusDescription() {
        moveToMacroQueue(() => {
            this.entityDescription?.ttEditor.editor.commands.focus()
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
                map(([, description]) => Boolean(description))
            )
        ),
        share({ resetOnRefCountZero: true })
    )

    children$ = this.listEntity$.pipe(
        map(entity => entity?.children?.filter(child => child.entityType != EntityType.TASK))
    )
    createSublist() {
        this.listEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(listActions.createTaskList({ parentListId: entity.id }))
        })
    }

    tasks$ = combineLatest([this.store.select(entitiesSelectors.taskTreeMap), this.listEntity$]).pipe(
        map(([taskTreeMap, entity]) => {
            if (!taskTreeMap || !entity) return null

            return taskTreeMap[entity.id] || []
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )
    createTask() {
        this.listEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(taskActions.create({ listId: entity.id }))
        })
    }
}
