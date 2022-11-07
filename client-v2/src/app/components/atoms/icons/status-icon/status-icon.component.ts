import { Component, Input } from '@angular/core'
import { TaskStatus } from 'src/app/models/task.model'

export enum TaskState {
    BLOCKED = 'Blocked',
    LOADING = 'Loading',
}

type TaskDisplayState = TaskStatus | TaskState

const statusIconClassMap: Record<TaskDisplayState, string> = {
    [TaskStatus.OPEN]: 'far fa-circle text-tinted-300',
    [TaskStatus.IN_PROGRESS]: 'far fa-clock text-secondary-400',
    [TaskStatus.BACKLOG]: 'fas fa-spinner text-tinted-300 rotate-[-45deg]',
    [TaskStatus.COMPLETED]: 'fas fa-check-circle text-submit-400',
    [TaskStatus.NOT_PLANNED]: 'fas fa-times-circle text-danger-400',
    [TaskState.BLOCKED]: 'far fa-ban text-tinted-300',
    [TaskState.LOADING]: 'far fa-spinner-third animate-spin text-tinted-200',
}

@Component({
    selector: 'status-icon',
    templateUrl: './status-icon.component.html',
    styleUrls: [],
})
export class StatusIconComponent {
    @Input() status: TaskDisplayState = TaskStatus.OPEN
    statusIconClassMap = statusIconClassMap
}
