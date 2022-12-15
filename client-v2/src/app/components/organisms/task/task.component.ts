import { Component, Input, OnInit } from '@angular/core'
import { Task, TaskPriority, TaskStatus } from '../../../models/task.model'
import { PageEntityState, TaskState } from '../../atoms/icons/page-entity-icon/page-entity-icon.component'

@Component({
    selector: 'task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
    ngOnInit() {
        // dummy loading time
        if (this.data.description) setTimeout(() => (this.loading = false), Math.random() * 5000)
        else this.loading = false
    }
    @Input() data!: Task
    TaskStatus = TaskStatus
    TaskPriority = TaskPriority

    isOverdue = false
    loading: false | PageEntityState.LOADING = PageEntityState.LOADING
    blocked: false | TaskState.BLOCKED = false // disabled for now
}
