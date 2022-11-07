import { Component, Input, OnInit } from '@angular/core'
import { ITask, TaskPriority, TaskStatus } from '../../../models/task.model'
import { TaskState } from '../../atoms/icons/status-icon/status-icon.component'

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
    @Input() data!: ITask
    TaskStatus = TaskStatus
    TaskPriority = TaskPriority

    isOverdue = false
    loading: false | TaskState.LOADING = TaskState.LOADING
    blocked: false | TaskState.BLOCKED = false // disabled for now
}
