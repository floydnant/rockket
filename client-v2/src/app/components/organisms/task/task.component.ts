import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { BehaviorSubject, map } from 'rxjs'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TaskPreview, TaskPriority, TaskStatus } from '../../../fullstack-shared-models/task.model'
import { PageEntityState, TaskState } from '../../atoms/icons/page-entity-icon/page-entity-icon.component'
import { MenuItem } from '../../molecules/drop-down/drop-down.component'
import { TaskTreeNode } from '../task-tree/task-tree.component'

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
    nodeData$ = new BehaviorSubject<Omit<TaskTreeNode, 'taskPreview'> | null>(null)
    @Input() set data({ taskPreview, ...data }: TaskTreeNode) {
        this.nodeData$.next(data)
        this.task$.next(taskPreview)
    }

    menuItems$_ = new BehaviorSubject<MenuItem[] | null>(null)
    @Input() set menuItems(items: MenuItem[]) {
        this.menuItems$_.next(items)
    }
    // @TODO: This is a hacky way, lets find a better solution
    menuItems$ = this.menuItems$_.pipe(
        map(items => {
            return items?.map(item => ({ ...item, route: item.route?.replace(/:id/, this.task$.value?.id || ':id') }))
        })
    )

    @Output() expansionChange = new EventEmitter<boolean>()

    @Output() titleChange = new EventEmitter<string>()
    @Output() descriptionChange = new EventEmitter<string>()
    @Output() statusChange = new EventEmitter<TaskStatus>()
    @Output() priorityChange = new EventEmitter<TaskPriority>()

    isOverdue = false
    loading: false | PageEntityState.LOADING = false
    blocked: false | TaskState.BLOCKED = false // disabled for now
}
