import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TaskPreview, TaskPriority, TaskStatus } from '../../../fullstack-shared-models/task.model'
import { PageEntityState, TaskState } from '../../atoms/icons/page-entity-icon/page-entity-icon.component'
import { MenuItem } from '../../molecules/drop-down/drop-down.component'

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComponent {
    EntityType = EntityType
    TaskStatus = TaskStatus
    TaskPriority = TaskPriority

    task$ = new BehaviorSubject<TaskPreview | null>(null)
    @Input() set task(tasks: TaskPreview) {
        this.task$.next(tasks)
    }

    menuItems$ = new BehaviorSubject<MenuItem[] | null>(null)
    @Input() set menuItems(items: MenuItem[]) {
        this.menuItems$.next(items)
    }

    @Output() titleChange = new EventEmitter<string>()
    @Output() descriptionChange = new EventEmitter<string>()
    @Output() statusChange = new EventEmitter<TaskStatus>()
    @Output() priorityChange = new EventEmitter<TaskPriority>()

    isOverdue = false
    loading: false | PageEntityState.LOADING = false
    blocked: false | TaskState.BLOCKED = false // disabled for now
}
