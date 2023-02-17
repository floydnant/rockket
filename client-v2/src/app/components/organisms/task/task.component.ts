import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { BehaviorSubject, map } from 'rxjs'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { ENTITY_TITLE_DEFAULTS } from 'src/app/shared/defaults'
import { TaskPreview, TaskPriority, TaskStatus } from '../../../fullstack-shared-models/task.model'
import { EntityState } from '../../atoms/icons/icon/icons'
import { MenuItem } from '../../molecules/drop-down/drop-down.component'
import { TaskTreeNode } from '../task-tree/task-tree.component'
import { colors, taskStatusColorMap } from 'src/app/shared/colors'

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
    PLACEHOLDER = ENTITY_TITLE_DEFAULTS[EntityType.TASK]

    statusColorMap = {
        ...taskStatusColorMap,
        [TaskStatus.OPEN]: 'text-tinted-100',
        [TaskStatus.BACKLOG]: 'text-tinted-100',
    }

    placeholderColorMap = {
        ...(Object.fromEntries(Object.values(TaskStatus).map(status => [status, colors.tinted[400]])) as Record<
            TaskStatus,
            string
        >),
        [TaskStatus.COMPLETED]: colors.submit[600],
    }

    task$ = new BehaviorSubject<TaskPreview | null>(null)
    nodeData$ = new BehaviorSubject<Omit<TaskTreeNode, 'taskPreview'> | null>(null)
    @Input() set data({ taskPreview, ...data }: TaskTreeNode) {
        this.nodeData$.next(data)
        this.task$.next(taskPreview)
    }

    menuItems$ = new BehaviorSubject<MenuItem[] | null>(null)
    @Input() set menuItems(items: MenuItem[]) {
        this.menuItems$.next(items)
    }

    statusMenuItems$ = this.menuItems$.pipe(map(items => items?.find(({ title }) => title == 'Status')?.children || []))
    priorityMenuItems$ = this.menuItems$.pipe(
        map(items => items?.find(({ title }) => title == 'Priority')?.children || [])
    )

    @Output() expansionChange = new EventEmitter<boolean>()

    @Output() titleChange = new EventEmitter<string>()
    @Output() descriptionChange = new EventEmitter<string>()
    @Output() statusChange = new EventEmitter<TaskStatus>()
    @Output() priorityChange = new EventEmitter<TaskPriority>()

    isOverdue = false
    @Input() isLoading = false
    get loading() {
        return this.isLoading ? EntityState.LOADING : false
    }
    blocked = false // disabled for now

    isHovered = false
}
