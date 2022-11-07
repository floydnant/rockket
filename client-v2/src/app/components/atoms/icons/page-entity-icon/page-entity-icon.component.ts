import { Component, Input } from '@angular/core'
import { TaskStatus } from 'src/app/models/task.model'
import { TaskDisplayState } from '../status-icon/status-icon.component'

export type PageEntityIconKey = TaskDisplayState | 'tasklist'

@Component({
    selector: 'page-entity-icon',
    templateUrl: './page-entity-icon.component.html',
    styleUrls: ['./page-entity-icon.component.css'],
})
export class PageEntityIconComponent {
    @Input() icon!: PageEntityIconKey

    TaskStatus = TaskStatus
}
