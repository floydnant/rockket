import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Store } from '@ngrx/store'
import { BehaviorSubject, of } from 'rxjs'
import { TaskPreview, TaskPriority, TaskStatus } from 'src/app/fullstack-shared-models/task.model'
import { getGeneralMenuItems } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { taskActions } from 'src/app/store/entities/entities.actions'

@Component({
    selector: 'app-task-tree',
    templateUrl: './task-tree.component.html',
    styleUrls: ['./task-tree.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTreeComponent {
    constructor(private store: Store<AppState>) {}

    tasks$ = new BehaviorSubject<TaskPreview[] | null>(null)
    @Input() set tasks(tasks: TaskPreview[]) {
        this.tasks$.next(tasks)
    }

    menuItems$ = of(getGeneralMenuItems(this.store))

    onTitleChange(id: string, newTitle: string) {
        this.store.dispatch(taskActions.rename({ id, newTitle }))
        // @TODO: use this
        // this.store.dispatch(entitiesActions.rename({ id, newTitle, entityType: EntityType.TASK }))
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
