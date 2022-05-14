import { Component, Input } from '@angular/core';

@Component({
    selector: 'task-progress',
    templateUrl: './task-progress.component.html',
    styleUrls: ['./task-progress.component.css'],
})
export class TaskProgressComponent {
    @Input() tasksCount: number;
    @Input() completedTasksCount: number;
    @Input() openTasksCount: number;

    @Input() showAlways = false;
}
