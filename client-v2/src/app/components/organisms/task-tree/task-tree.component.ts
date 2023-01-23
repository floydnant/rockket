import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Store } from '@ngrx/store'
import { BehaviorSubject, of } from 'rxjs'
import { TaskPreviewRecursive, TaskPriority, TaskStatus } from 'src/app/fullstack-shared-models/task.model'
import { getEntityMenuItemsMap } from 'src/app/shared/entity-menu-items'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { AppState } from 'src/app/store'
import { entitiesActions, taskActions } from 'src/app/store/entities/entities.actions'

@Component({
    selector: 'app-task-tree',
    templateUrl: './task-tree.component.html',
    styleUrls: ['./task-tree.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTreeComponent {
    constructor(private store: Store<AppState>) {}

    tasks$ = new BehaviorSubject<TaskPreviewRecursive[] | null>(null)
    @Input() set tasks(tasks: TaskPreviewRecursive[]) {
        this.tasks$.next(tasks)
    }

    menuItems$ = of(getEntityMenuItemsMap(this.store)[EntityType.TASK])

    onTitleChange(id: string, title: string) {
        this.store.dispatch(entitiesActions.rename({ id, title, entityType: EntityType.TASK }))
    }
    onDescriptionChange(id: string, newDescription: string) {
        this.store.dispatch(taskActions.updateDescription({ id, newDescription }))
    }
    onStatusChange(id: string, status: TaskStatus) {
        this.store.dispatch(taskActions.updateStatus({ id, status }))
    }
    onPriorityChange(id: string, priority: TaskPriority) {
        this.store.dispatch(taskActions.updatePriority({ id, priority }))
    }
}
