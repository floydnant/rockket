import { ChangeDetectionStrategy, Component, Inject } from '@angular/core'
import { Store } from '@ngrx/store'
import { combineLatest, map } from 'rxjs'
import { TaskDetail } from 'src/app/fullstack-shared-models/task.model'
import { AppState } from 'src/app/store'
import { entitiesSelectors } from 'src/app/store/entities/entities.selectors'
import { getTaskById } from 'src/app/store/entities/utils'
import { EntityViewData, ENTITY_VIEW_DATA } from '../../entity-view.component'

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
}
