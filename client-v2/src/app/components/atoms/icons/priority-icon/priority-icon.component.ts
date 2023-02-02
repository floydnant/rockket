import { Component, Input } from '@angular/core'
import { TaskPriority } from 'src/app/fullstack-shared-models/task.model'

const statusIconClassMap: Record<TaskPriority, { amount?: number; class: string }> = {
    [TaskPriority.OPTIONAL]: { class: 'fas fa-question text-tinted-300' },
    [TaskPriority.NONE]: { class: 'far fa-exclamation text-tinted-300' },
    [TaskPriority.MEDIUM]: { class: 'fas fa-exclamation text-danger-400' },
    [TaskPriority.HIGH]: { amount: 2, class: 'fas fa-exclamation text-danger-400' },
    [TaskPriority.URGENT]: { class: 'fas fa-exclamation-square text-danger-400' },
}

@Component({
    selector: 'priority-icon',
    templateUrl: './priority-icon.component.html',
    styleUrls: [],
})
export class PriorityIconComponent {
    @Input() priority: TaskPriority = TaskPriority.NONE
    priorityIconMap = statusIconClassMap

    range(length: number) {
        return new Array(length).fill(null)
    }
}
