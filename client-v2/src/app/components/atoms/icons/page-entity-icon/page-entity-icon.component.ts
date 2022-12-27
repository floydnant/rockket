import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { EntityType } from 'src/app/models/entities.model'
import { TaskStatus } from 'src/app/models/task.model'

/** This will come from the db */
// export enum EntityType {
//     TASKLIST = 'Tasklist',
//     TASK = 'Task',
//     DOCUMENT = 'Document',
//     VIEW = 'View',
// }

export enum PageEntityState {
    LOADING = 'Loading',
}

export enum TaskState {
    BLOCKED = 'Blocked',
    // LOADING = 'Loading',
}
export type TaskIconKey = TaskStatus | TaskState

// const entityTypeWithoutTask = {
//     [EntityType.TASKLIST]: 'Tasklist',
//     [EntityType.DOCUMENT]: 'Document',
//     [EntityType.VIEW]: 'View',
// }
// type EntityTypeWihoutTask = keyof typeof entityTypeWithoutTask
export type PageEntityIconKey = TaskIconKey | EntityType | PageEntityState

export const taskStatusIconClassMap: Record<TaskIconKey, string> = {
    [TaskStatus.OPEN]: 'far fa-circle text-tinted-300',
    [TaskStatus.IN_PROGRESS]: 'far fa-clock text-secondary-400',
    [TaskStatus.BACKLOG]: 'fas fa-spinner text-tinted-300 rotate-[-45deg]',
    [TaskStatus.COMPLETED]: 'fas fa-check-circle text-submit-400',
    [TaskStatus.NOT_PLANNED]: 'fas fa-times-circle text-danger-400',
    [TaskState.BLOCKED]: 'far fa-ban text-tinted-300',
    // [TaskState.LOADING]: 'far fa-spinner-third animate-spin text-tinted-200',
}

export const entityIconClassMap: Record<PageEntityIconKey, string> = {
    [EntityType.TASKLIST]: 'far fa-tasks text-tinted-400',
    // [EntityType.DOCUMENT]: 'far fa-file-alt text-tinted-400',
    // [EntityType.VIEW]: 'far fa-binoculars text-tinted-400',
    [PageEntityState.LOADING]: 'far fa-spinner-third animate-spin text-tinted-200',
    ...taskStatusIconClassMap,
}

export const isPageEntityIcon = (iconClass: string): iconClass is PageEntityIconKey => {
    return iconClass in entityIconClassMap
}

@Component({
    selector: 'page-entity-icon',
    templateUrl: './page-entity-icon.component.html',
    styleUrls: ['./page-entity-icon.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEntityIconComponent {
    @Input() icon!: PageEntityIconKey

    entityIconClassMap = entityIconClassMap
}
